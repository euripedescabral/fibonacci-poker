#!/usr/bin/env python3
"""Validate project plans without application dependencies."""
import json
import re
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
errors = []
m = json.loads((root / 'plans/manifest.json').read_text())
headings = ['Layer 1 —', 'Layer 1.5 —', 'Layer 1.6 —', 'Layer 2 —', 'Layer 3 —',
            'Layer 3.1 — Dispatch Table', 'Layer 3.2 — UI Flow Matrix', 'Layer 4 —', 'Layer 5 —']
seen = set()
statuses = {}
for entry in m['plans']:
    source = root / entry['path']
    if source.exists():
        match = re.search(r'^status: (.+)$', source.read_text(), re.M)
        statuses[entry['id']] = match.group(1) if match else 'missing'
for p in m['plans']:
    file = root / p['path']
    if not file.is_file():
        errors.append('Missing plan '+p['path']); continue
    text = file.read_text()
    for heading in headings:
        if heading not in text: errors.append(file.name+': missing '+heading)
    for dep in p['depends']:
        if dep not in seen: errors.append(p['id']+': invalid dependency '+dep)
    status = statuses.get(p['id'])
    if file.parent.name == 'done' and status != 'complete':
        errors.append(file.name+': archived without complete status')
    if file.parent.name == 'deferred' and status != 'deferred':
        errors.append(file.name+': deferred status mismatch')
    if file.parent.name == 'active':
        if status not in ('not-started', 'in-progress'):
            errors.append(file.name+': active status mismatch')
        if any(statuses.get(dep) != 'complete' for dep in p['depends']):
            errors.append(file.name+': active with incomplete dependency')
    for phase in p['phases']:
        if not 1 <= len(phase['files']) <= 10: errors.append(phase['id']+': file count')
        if len(set(phase['files'])) != len(phase['files']): errors.append(phase['id']+': duplicates')
        for target in phase['files']:
            if '`'+target+'`' not in text: errors.append(phase['id']+': missing file '+target)
        if phase['gate'] not in text: errors.append(phase['id']+': mismatched gate')
    seen.add(p['id'])
files = [root/'README.md', root/'AGENTS.md', *root.glob('docs/**/*.md'), *root.glob('plans/**/*.md')]
for file in files:
    text = file.read_text()
    if re.search(r'/Users/|/home/[^/]+/|gh[pousr]_[A-Za-z0-9]{20,}|BEGIN .*PRIVATE KEY',text):
        errors.append(str(file.relative_to(root))+': private path or credential pattern')
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',text):
        if '://' in target or target.startswith('#'): continue
        relative = target.split('#',1)[0]
        if relative and not (file.parent/relative).exists(): errors.append(file.name+': broken link '+target)
product=(root/'docs/product.md').read_text(); acceptance=(root/'docs/acceptance.md').read_text()
for r in m['requirements']:
    if r not in product or r not in acceptance: errors.append('Missing coverage '+r)
for t in m['acceptance']:
    if '| '+t+' |' not in acceptance: errors.append('Missing case '+t)
if len(seen)!=6: errors.append('Expected six execution plans')
if errors:
    print('\n'.join('FAIL: '+e for e in errors)); sys.exit(1)
print(f'PASS: {len(seen)} KERNEL plans, {len(files)} Markdown files; links, dependencies, phase inventories and requirement coverage.')
print('Structure only; runtime evidence is recorded separately by each plan.')
