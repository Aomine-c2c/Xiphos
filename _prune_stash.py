from pathlib import Path
import os
import shutil

repo = Path(r"C:\Users\armut\404\Xiphos")
stash = repo / "prune-stash-20260707"

actions = [
    ("src-tauri/target/release/deps",          "tauri deps"),
    ("src-tauri/target/release/incremental",   "tauri incremental"),
    ("src-tauri/target/release/nsis",          "tauri installer bundle"),
    ("src-tauri/target/release/examples",      "tauri examples"),
    ("src-tauri/target/release/bundle",        "tauri bundle"),
    ("src-tauri/target/debug",                 "tauri debug artifacts"),
    ("web/.next",                              "next build cache"),
    ("dump.rdb",                               "redis dump"),
    ("logs/xiphos.2026-06-29_14-49-50_311923.log", "old dated log"),
    ("worker_engine.py.bak",                   "root bak"),
    ("xiphos.egg-info",                        "egg-info"),
    ("__pycache__",                            "pycache"),
    (".pytest_cache",                           "pytest cache"),
    ("backtest_results.csv",                   "root csv"),
    ("backtest_mahoraga_results.csv",          "root csv"),
    ("deep_backtest_results.csv",              "root csv"),
    ("mahoraga_adaptation_log.csv",            "root csv"),
    ("test_run.log",                           "root log"),
]

skip = {repo/".git", repo/"venv", repo/"node_modules"}

count = 0
report = []

for rel, label in actions:
    p = repo / rel
    if not p.exists():
        continue
    if any(p == s or s in p.parents for s in skip):
        continue
    dest = stash / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(p), str(dest))
    report.append(f"MOVED {rel} ({label})")
    count += 1

for root, dirs, files in os.walk(str(repo)):
    if any(Path(root) == s or s in Path(root).parents for s in skip):
        continue
    for f in files:
        if f.endswith(".bak"):
            src = Path(root) / f
            rel = src.relative_to(repo)
            dest = stash / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dest))
            report.append(f"MOVED {rel} (subdir bak)")
            count += 1

(stash / "MANIFEST.txt").write_text(
    "Xiphos prune-stash 2026-07-07\nUndo: copy contents back to Xiphos root with the same relative paths.\n\n"
    + "\n".join(report),
    encoding="utf-8",
)

print(f"PRUNE_SUMMARY stash={stash}")
print(f"MOVED={count}")
for r in report:
    print(r)
