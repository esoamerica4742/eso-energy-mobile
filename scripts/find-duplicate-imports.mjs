import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue;
      walk(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

const dupes = [];
for (const file of walk(path.join(root, 'src'))) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const seen = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('import ')) continue;
    if (seen.has(line)) dupes.push({ file: path.relative(root, file), line: i + 1, text: line });
    seen.add(line);
  }
}

console.log(JSON.stringify(dupes, null, 2));
