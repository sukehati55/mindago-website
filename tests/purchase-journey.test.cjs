const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
function pages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['.git', 'node_modules', 'tmp'].includes(entry.name)) return [];
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? pages(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}
test('public Founding 50 CTAs use verified-parent reserved Checkout, not the legacy direct link', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const target = 'https://join.mindago.my/founding50';
  assert.ok(html.includes('href="' + target + '"'));
  assert.ok(html.includes('verified parent checkout'));
  for (const file of pages(root)) {
    const source = fs.readFileSync(file, 'utf8');
    assert.equal(/href=["\x27]https:\/\/buy\.stripe\.com\//i.test(source), false, path.relative(root, file));
  }
});
