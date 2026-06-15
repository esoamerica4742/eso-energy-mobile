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

const files = new Map();

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
      if (block.type !== 'tool_use') continue;
      const name = block.name;
      const input = block.input;
      if (!input?.path) continue;
      const rel = normalizeRepoPath(input.path);
      if (!rel) continue;
      if (name === 'Write' && typeof input.contents === 'string') {
        files.set(rel, input.contents);
      }
    }
  }
}

let written = 0;
let skipped = 0;
for (const [rel, contents] of files) {
  const dest = path.join(REPO, rel);
  const prev = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
  if (prev === contents) {
    skipped += 1;
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, contents, 'utf8');
  written += 1;
}

console.log(JSON.stringify({ transcriptDir: TRANSCRIPT_DIR, restored: written, unchanged: skipped, totalWrites: files.size }, null, 2));
