"""Build the public Pages artifact. Optional GA4 stays off unless approved."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil

parser = argparse.ArgumentParser()
parser.add_argument('--output', required=True, type=Path)
parser.add_argument('--analytics', choices=('off', 'on'), default='off')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
output = args.output.resolve()
if output == root or output in root.parents or (output.exists() and any(output.iterdir())):
    raise SystemExit('Use an empty output directory separate from the source.')
output.mkdir(parents=True, exist_ok=True)
for source in root.iterdir():
    if source.is_file() and (source.suffix in ('.html', '.css', '.js', '.txt', '.xml') or source.name in ('_headers', '_redirects')):
        shutil.copy2(source, output / source.name)
for name in ('assets', 'books', 'preschool-learning-app', 'teaching-resources'):
    shutil.copytree(root / name, output / name)
removed = 0
for page in output.rglob('*.html'):
    text = page.read_text(encoding='utf-8')
    if args.analytics == 'off':
        text, count = re.subn(r'<script\b[^>]*\bsrc=["\x27][^"\x27]*analytics\.js(?:\?[^"\x27]*)?["\x27][^>]*>\s*</script>', '', text, flags=re.I)
        removed += count
        if re.search(r'<script\b[^>]*\bsrc=["\x27][^"\x27]*(?:analytics\.js|googletagmanager|google-analytics)', text, re.I):
            raise SystemExit('Unexpected analytics loader in release artifact.')
    page.write_text(text, encoding='utf-8', newline='\n')
files = [{'path': p.relative_to(output).as_posix(), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(output.rglob('*')) if p.is_file()]
print(json.dumps({'analytics': args.analytics, 'analytics_tags_removed': removed, 'files': files}, indent=2))
