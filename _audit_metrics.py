import ast, os, re, sys
from pathlib import Path

ROOT = Path('/c/Users/armut/404/Xiphos')
PY = [p for p in ROOT.rglob('*.py')
      if not any(part in {'venv','.venv','node_modules','dist','.next','__pycache__'}
                 for part in p.parts)]

PY.sort()

rows = []
for path in PY:
    try:
        src = path.read_text(encoding='utf-8', errors='ignore')
    except Exception as e:
        continue
    try:
        tree = ast.parse(src)
    except SyntaxError:
        tree = None

    lines = src.splitlines()
    loc = len(lines)
    classes = len([n for n in ast.walk(tree or ast.parse('')) if isinstance(n, ast.ClassDef)])
    funcs = len([n for n in ast.walk(tree or ast.parse('')) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))])
    # missing def type hints: any function without return annotation and no docstring saying return
    def_missing = 0
    for node in ast.walk(tree or ast.parse('')):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if not getattr(node, 'returns', None) and not ast.get_docstring(node):
                def_missing += 1
    imports = [n for n in ast.walk(tree or ast.parse('')) if isinstance(n, (ast.Import, ast.ImportFrom))]
    rel = path.relative_to(ROOT)
    row = {
        'path': str(rel),
        'loc': loc,
        'classes': classes,
        'funcs': funcs,
        'missing_return_hint': def_missing,
        'imports': len(imports),
    }
    # smells
    row.update({
        'has_exec': bool(re.search(r'\bexec\s*\(', src)),
        'has_eval': bool(re.search(r'\beval\s*\(', src)),
        'has_pickle': bool(re.search(r'pickle\.load', src)),
        'has_globals': bool(re.search(r'\bglobals\s*\(', src)),
        'has_subprocess': bool(re.search(r'subprocess\.|os\.system|os\.popen', src)),
        'has_shelve': bool(re.search(r'\bshelve\b', src)),
        'has_sql_cursor': bool(re.search(r'\.execute\s*\(', src)),
        'has_hardcoded_password': bool(re.search(r"(?i)(password|passwd|pwd|secret|api_key|apikey)\s*=\s*['\"]", src)),
        'has_fstring_sql': bool(re.search(r"f['\"].*SELECT|INSERT|UPDATE|DELETE", src, re.I)),
        'has_format_sql': bool(re.search(r"\.format\(.*SELECT|INSERT|UPDATE|DELETE", src, re.I)),
    })
    rows.append(row)

# write CSV
out = Path('/tmp/xiphos_metrics.csv')
with out.open('w', encoding='utf-8') as f:
    cols = ['path','loc','classes','funcs','missing_return_hint','imports','has_exec','has_eval','has_pickle','has_globals','has_subprocess','has_shelve','has_sql_cursor','has_hardcoded_password','has_fstring_sql','has_format_sql']
    f.write(','.join(cols)+'\n')
    for r in rows:
        f.write(','.join(str(r[c]) for c in cols)+'\n')

print(f'Records: {len(rows)} -> {out}')

# import graph limited to project folders
imports = []
for path in PY:
    rel = str(path.relative_to(ROOT)).replace(os.sep, '.')
    if rel.endswith('.py'):
        rel = rel[:-3]
    for node in ast.walk(ast.parse(path.read_text(encoding='utf-8', errors='ignore'), type_comments=False)):
        n = None
        if isinstance(node, ast.Import) and node.names:
            n = node.names[0].name
        elif isinstance(node, ast.ImportFrom) and node.module:
            n = node.module
        if not n:
            continue
        # keep only project inpackage-like imports
        if n.split('.')[0] in {'bridge','core','execution','indicators','monitoring','risk','storage','strategies','tests','dashboard'}:
            imports.append((rel, n.split('.')[0]))
        elif rel.startswith(tuple({'bridge','core','execution','indicators','monitoring','risk','storage','strategies','tests','dashboard'})):
            # keep cross-refs under same domains
            pass

# find cycles by BFS over adjacent modules
from collections import defaultdict, deque
adj = defaultdict(set)
for a, b in imports:
    if a == b:
        continue
    adj[a].add(b)

def find_cycle():
    visited = set()
    for start in list(adj):
        if start in visited:
            continue
        q = deque([(start, [start])])
        visited.add(start)
        while q:
            node, path = q.popleft()
            sb = set(str(n).split('.')[0] for n in adj.get(node, []))
            for nxt in sb:
                if nxt in path:
                    return path[path.index(nxt):] + [nxt]
                if nxt not in visited:
                    visited.add(nxt)
                    q.append((nxt, path+[nxt]))
    return []

# Better trace: build only top-level edges among project packages and detect cycles.
graph = defaultdict(set)
for path in PY:
    tree = None
    try:
        tree = ast.parse(path.read_text(encoding='utf-8', errors='ignore'))
    except Exception:
        continue
    rel = path.relative_to(ROOT)
    pkg = str(rel).split(os.sep)[0]
    if pkg not in {'bridge','core','execution','indicators','monitoring','risk','storage','strategies','tests','dashboard'}:
        continue
    for node in ast.walk(tree):
        if not isinstance(node, ast.ImportFrom) or not node.module:
            continue
        top = node.module.split('.')[0]
        if top == pkg:
            continue
        if top in {'bridge','core','execution','indicators','monitoring','risk','storage','strategies','tests','dashboard'}:
            graph[pkg].add(top)

visited = {}
stack = []
cycle = None

def dfs(u):
    visited[u] = 0
    for v in graph.get(u, []):
        if v in visited and visited[v] == 0:
            return [u, v]
        if v not in visited:
            c = dfs(v)
            if c:
                return c
    visited[u] = 1
    return None

c = None
for node in list(graph):
    if node not in visited:
        c = dfs(node)
        if c:
            break

print('Cycle candidates:', c)
print('Graph edges:')
for k,v in sorted(graph.items()):
    if v:
        print(' ', k, '->', sorted(v))
print('Top long files:')
for r in sorted(rows, key=lambda x: x['loc'], reverse=True)[:20]:
    print(f"  {r['path']:60} loc={r['loc']} classes={r['classes']} funcs={r['funcs']} missing_hints={r['missing_return_hint']}")
