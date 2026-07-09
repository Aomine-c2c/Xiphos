use std::{
    collections::HashMap,
    path::PathBuf,
    process::{Child, Command},
    sync::atomic::{AtomicBool, Ordering},
    sync::Arc,
    time::Duration,
};
use tauri::{AppHandle, Manager};

/// Represents one managed backend process
struct ManagedProcess {
    name: &'static str,
    child: Child,
}

/// Registry of all spawned backend processes
pub struct ProcessRegistry {
    processes: Vec<ManagedProcess>,
    running: Arc<AtomicBool>,
}

impl ProcessRegistry {
    pub fn new() -> Self {
        Self {
            processes: Vec::new(),
            running: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Resolve paths relative to the app's resource directory (bundled) or dev directory.
    fn resolve_paths(app: &AppHandle) -> (PathBuf, PathBuf, PathBuf) {
        let resource_dir = app
            .path()
            .resource_dir()
            .unwrap_or_else(|_| PathBuf::from("."));

        // Bundled python-embed or dev .venv
        let python_embed = resource_dir.join("resources").join("python-embed");
        let python_exe = if python_embed.exists() {
            python_embed.join("python.exe")
        } else {
            // Dev mode: use the project's .venv
            let root = Self::root_dir(app);
            root.join("backend").join(".venv").join("Scripts").join("python.exe")
        };

        // Bundled redis or dev tools/redis
        let redis_exe = {
            let bundled = resource_dir.join("resources").join("redis").join("redis-server.exe");
            if bundled.exists() {
                bundled
            } else {
                let root = Self::root_dir(app);
                root.join("backend").join("tools").join("redis").join("redis-server.exe")
            }
        };

        let root = Self::root_dir(app);
        (python_exe, redis_exe, root)
    }

    fn root_dir(app: &AppHandle) -> PathBuf {
        // In dev, resource_dir is inside src-tauri — go up one level to project root
        #[cfg(debug_assertions)]
        {
            let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
            manifest.parent().unwrap_or(&manifest).to_path_buf()
        }
        #[cfg(not(debug_assertions))]
        {
            app.path().app_local_data_dir().unwrap_or(PathBuf::from("."))
        }
    }

    /// Launch all Xiphos backend services in the correct order.
    pub fn launch_all(&mut self, app: &AppHandle) -> Result<(), String> {
        let (python_exe, redis_exe, root) = Self::resolve_paths(app);

        if !redis_exe.exists() {
            return Err(format!("Redis not found at {}", redis_exe.display()));
        }
        if !python_exe.exists() {
            return Err(format!("Python not found at {}", python_exe.display()));
        }

        let mut env: HashMap<String, String> = std::env::vars().collect();
        let backend_dir = root.join("backend");
        env.insert("PYTHONPATH".into(), backend_dir.display().to_string());
        env.insert("PYTHONUNBUFFERED".into(), "1".into());
        env.insert("XIPHOS_TUI".into(), "1".into());

        // ── 1. Redis ─────────────────────────────────────────────────────
        self.spawn("Redis", &redis_exe, &[], &backend_dir, &env)?;
        std::thread::sleep(Duration::from_millis(1500));
        self.check_alive("Redis")?;

        // ── 2. Bridge ─────────────────────────────────────────────────────
        self.spawn_python(
            "Bridge",
            &python_exe,
            &["-m", "uvicorn", "bridge.server:app", "--port", "8000", "--no-access-log"],
            &backend_dir,
            &env,
        )?;
        std::thread::sleep(Duration::from_millis(2000));
        self.check_alive("Bridge")?;

        // ── 3. API Server ─────────────────────────────────────────────────
        self.spawn_python(
            "API Server",
            &python_exe,
            &["-m", "uvicorn", "api_server:app", "--port", "8001", "--no-access-log"],
            &backend_dir,
            &env,
        )?;
        std::thread::sleep(Duration::from_millis(2000));
        self.check_alive("API Server")?;

        // ── 4. Worker Engine ─────────────────────────────────────────────
        self.spawn_python("Worker", &python_exe, &["worker_engine.py"], &backend_dir, &env)?;
        std::thread::sleep(Duration::from_millis(2000));
        self.check_alive("Worker")?;

        self.running.store(true, Ordering::SeqCst);
        eprintln!("[Xiphos] All services launched successfully.");
        Ok(())
    }

    fn spawn(
        &mut self,
        name: &'static str,
        exe: &PathBuf,
        args: &[&str],
        cwd: &PathBuf,
        env: &HashMap<String, String>,
    ) -> Result<(), String> {
        let child = Command::new(exe)
            .args(args)
            .current_dir(cwd)
            .envs(env)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to spawn {name}: {e}"))?;

        self.processes.push(ManagedProcess { name, child });
        Ok(())
    }

    fn spawn_python(
        &mut self,
        name: &'static str,
        python_exe: &PathBuf,
        args: &[&str],
        cwd: &PathBuf,
        env: &HashMap<String, String>,
    ) -> Result<(), String> {
        self.spawn(name, python_exe, args, cwd, env)
    }

    fn check_alive(&mut self, name: &str) -> Result<(), String> {
        for proc in &mut self.processes {
            if proc.name == name {
                match proc.child.try_wait() {
                    Ok(Some(status)) => {
                        return Err(format!(
                            "FATAL: {name} exited immediately (code {:?}). Check your config.",
                            status.code()
                        ))
                    }
                    Ok(None) => return Ok(()), // still running ✓
                    Err(e) => return Err(format!("Error checking {name} status: {e}")),
                }
            }
        }
        Err(format!("{name} not found in process registry"))
    }

    /// Gracefully terminate all managed processes.
    pub fn stop_all(&mut self) {
        self.running.store(false, Ordering::SeqCst);

        // Terminate in reverse launch order
        for proc in self.processes.iter_mut().rev() {
            eprintln!("[Xiphos] Stopping {}...", proc.name);
            let _ = proc.child.kill();
            let _ = proc.child.wait();
        }
        self.processes.clear();

        // Windows cleanup: forcefully kill any orphaned redis/python processes
        #[cfg(target_os = "windows")]
        {
            let _ = Command::new("taskkill")
                .args(["/F", "/IM", "redis-server.exe"])
                .stdout(std::process::Stdio::null())
                .stderr(std::process::Stdio::null())
                .spawn();
        }

        eprintln!("[Xiphos] All services stopped.");
    }
}

impl Drop for ProcessRegistry {
    fn drop(&mut self) {
        self.stop_all();
    }
}
