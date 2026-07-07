from pathlib import Path
import os
import shutil

repo = Path(r"C:\Users\armut\404\Xiphos")
stash = repo / "prune-stash-20260707"
report = []

actions = [
    # (path, mode, label)
    (repo / "src-tauri" / "target" / "release" / "deps",          "move",    "tauri deps"),
    (repo / "src-tauri" / "target" / "release" / "incremental",   "move",    "tauri incremental"),
    (repo / "src-tauri" / "target" / "release" / "nsis",          "move",    "tauri installer bundle"),
    (repo / "src-tauri" / "target" / "release" / "examples",      "move",    "tauri examples"),
    (repo / "src-tauri" / "target" / "release" / "bundle",        "move",    "tauri bundle"),
    (repo / "src-tauri" / "target" / "debug",                     "move",    "tauri debug artifacts"),
    (repo / "web" / ".next",                                      "move",    "next build cache"),
    (repo / "dump.rdb",                                           "move",    "redis dump"),
    (repo / "logs" / "xiphos.2026-06-29_14-49-50_311923.log",     "move",    "old dated log"),
    (repo / "worker_engine.py.bak",                               "move",    "root bak"),
    (repo / "xiphos.egg-info",                                    "move",    "egg-info"),
    (repo / "__pycache__",                                        "move",    "pycache"),
    (repo / ".pytest_cache",                                      "move",    "pytest cache"),
    (repo / "backtest_results.csv",                               "move",    "root csv"),
    (repo / "backtest_mahoraga_results.csv",                      "move",    "root csv"),
    (repo / "deep_backtest_results.csv",                         "move",    "root csv"),
    (repo / "mahoraga_adaptation_log.csv",                       "move",    "root csv"),
    (repo / "test_run.log",                                       "move",    "root log"),
]

# move any *.bak anywhere excluding venv/.git
skip = {repo/".git", repo/"venv", repo/"node_modules"}
for root, dirs, files in os.walk(str(repo)):
    if any(Path(root).is_relative_to(s) for s in skip):
        continue
    for f in files:
        if f.endswith(".bak"):
            actions.append((Path(root)/f, "move", "subdir bak"))

seen = set()
for p, mode, label in actions:
    if not p.exists() or str(p) in seen:
        continue
    seen.add(str(p))
    if mode == "move":
        dest = stash / p.relative_to(repo)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(p), str(dest))
        report.append(f"MOVED {p.relative_to(repo)}  ({label})")

out = stash / "MANIFEST.txt"
out.write_text("Xiphos prune-stash 2026-07-07\nUndo: copy contents back\n\n" + "\n".join(report), encoding="utf-8")
print(f"MOVED {len(report)} items to {stash}")
for r in report:
    print(r)
