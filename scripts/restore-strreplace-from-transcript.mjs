import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const TRANSCRIPT_DIR = path.resolve(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Preci-ESO-ENERGY-PROJECT-eso-energy-mobile/agent-transcripts/81811155-c57b-4f79-9245-8f8949b88395',
);

function collectJsonlFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsonlFiles(full));
    else if (entry.name.endsWith('.jsonl')) out.push(full);
  }
  return out;
}

function normalizeRepoPath(raw) {
  if (!raw) return null;
  const norm = raw.replace(/\\/g, '/');
  const marker = '/eso-energy-mobile/';
  const idx = norm.toLowerCase().indexOf(marker);
  if (idx === -1) return null;
  return norm.slice(idx + marker.length);
}

const ops = [];

for (const jsonlPath of collectJsonlFiles(TRANSCRIPT_DIR)) {
  const lines = fs.readFileSync(jsonlPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    const content = row.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block.type !== 'tool_use' || block.name !== 'StrReplace') continue;
      const input = block.input;
      const rel = normalizeRepoPath(input?.path);
      if (!rel || typeof input.old_string !== 'string' || typeof input.new_string !== 'string') continue;
      ops.push({
        rel,
        old_string: input.old_string,
        new_string: input.new_string,
        replace_all: Boolean(input.replace_all),
      });
    }
  }
}

let applied = 0;
let missed = 0;
const missedSamples = [];

for (const op of ops) {
  const dest = path.join(REPO, op.rel);
  if (!fs.existsSync(dest)) {
    missed += 1;
    if (missedSamples.length < 15) missedSamples.push({ file: op.rel, reason: 'missing' });
    continue;
  }
  let text = fs.readFileSync(dest, 'utf8');
  if (!text.includes(op.old_string)) {
    missed += 1;
    if (missedSamples.length < 15) missedSamples.push({ file: op.rel, reason: 'old_string not found' });
    continue;
  }
  if (op.replace_all) {
    const parts = text.split(op.old_string);
    text = parts.join(op.new_string);
  } else {
    text = text.replace(op.old_string, op.new_string);
  }
  fs.writeFileSync(dest, text, 'utf8');
  applied += 1;
}

console.log(
  JSON.stringify(
    { totalOps: ops.length, applied, missed, missedSamples },
    null,
    2,
  ),
);
