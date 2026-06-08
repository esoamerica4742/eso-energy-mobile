/**
 * One-off migration: replace legacy font postscript names with Inter across src/ and app/.
 * Run: node scripts/migrate-fonts-to-inter.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = [path.join(root, 'src'), path.join(root, 'app')];

const REPLACEMENTS = [
  ['Cormorant_600SemiBold_Italic', 'Inter_600SemiBold'],
  ['Cormorant_300Light_Italic', 'Inter_500Medium'],
  ['Cormorant_600SemiBold', 'Inter_600SemiBold'],
  ['Cormorant_300Light', 'Inter_400Regular'],
  ['Cormorant_700Bold', 'Inter_700Bold'],
  ['Playfair_700Bold', 'Inter_700Bold'],
  ['PlusJakartaSans_800ExtraBold', 'Inter_700Bold'],
  ['PlusJakartaSans_700Bold', 'Inter_700Bold'],
  ['PlusJakartaSans_600SemiBold', 'Inter_600SemiBold'],
  ['PlusJakartaSans_500Medium', 'Inter_500Medium'],
  ['PlusJakartaSans_400Regular', 'Inter_400Regular'],
  ['DMSans_700Bold', 'Inter_700Bold'],
  ['DMSans_500Medium', 'Inter_500Medium'],
  ['DMSans_400Regular', 'Inter_400Regular'],
  ['DMSans_300Light', 'Inter_400Regular'],
  ['Sora_800ExtraBold', 'Inter_700Bold'],
  ['Sora_700Bold', 'Inter_700Bold'],
  ['Sora_600SemiBold', 'Inter_600SemiBold'],
  ['Sora_500Medium', 'Inter_500Medium'],
  ['Sora_400Regular', 'Inter_400Regular'],
  ['Syne_800ExtraBold', 'Inter_700Bold'],
  ['Syne_700Bold', 'Inter_700Bold'],
  ['Syne_400Regular', 'Inter_400Regular'],
  ['SpaceMono_400Regular', 'Inter_400Regular'],
  ['BebasNeue_400Regular', 'Inter_700Bold'],
  ['Nunito_500Medium', 'Inter_500Medium'],
  ['Nunito_400Regular', 'Inter_400Regular'],
  ['Nunito_300Light', 'Inter_400Regular'],
  ['Nunito_200ExtraLight', 'Inter_400Regular'],
];

const SKIP = new Set(['node_modules', '.git', 'migrate-fonts-to-inter.mjs']);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?|css)$/.test(ent.name)) files.push(p);
  }
  return files;
}

let touched = 0;
for (const base of dirs) {
  if (!fs.existsSync(base)) continue;
  for (const file of walk(base)) {
    let text = fs.readFileSync(file, 'utf8');
    const orig = text;
    for (const [from, to] of REPLACEMENTS) {
      text = text.split(from).join(to);
    }
    text = text.replace(/fontStyle:\s*['"]italic['"]/g, '');
    text = text.replace(/fontStyle:\s*"italic"/g, '');
    if (text !== orig) {
      fs.writeFileSync(file, text);
      touched += 1;
    }
  }
}
console.log(`Updated ${touched} files.`);
