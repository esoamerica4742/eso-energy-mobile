import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..', 'src');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

const issues = [];
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  if (!/\bStyleSheet\b/.test(text)) continue;
  if (!/import\s*\{[^}]*StyleSheet[^}]*\}\s*from\s*['"]react-native['"]/.test(text)) {
    issues.push(path.relative(root, file));
  }
}

console.log(issues.join('\n'));
