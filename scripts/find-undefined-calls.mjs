import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..', 'src');
const builtins = new Set([
  'console', 'Math', 'JSON', 'Date', 'Promise', 'Error', 'Array', 'Object', 'String', 'Number',
  'Boolean', 'Map', 'Set', 'RegExp', 'Intl', 'parseInt', 'parseFloat', 'isNaN', 'undefined',
  'null', 'true', 'false', '__DEV__', 'require', 'module', 'exports', 'process', 'globalThis',
]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}

function collectImports(text) {
  const names = new Set();
  for (const m of text.matchAll(/import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s+from/g)) {
    if (m[1]) {
      for (const part of m[1].split(',')) {
        const alias = part.trim().split(/\s+as\s+/);
        names.add(alias[alias.length - 1].trim());
      }
    } else if (m[2]) names.add(m[2]);
  }
  return names;
}

function collectLocalDecls(text) {
  const names = new Set();
  for (const m of text.matchAll(/(?:const|let|var|function|class|type|interface|enum)\s+(\w+)/g)) names.add(m[1]);
  for (const m of text.matchAll(/(?:export\s+)?(?:const|function)\s+(\w+)/g)) names.add(m[1]);
  return names;
}

const suspects = [];
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  const imports = collectImports(text);
  const locals = collectLocalDecls(text);
  const scope = new Set([...imports, ...locals, ...builtins]);

  // Hook/component calls as undefined refs
  for (const m of text.matchAll(/\b([A-Z][A-Za-z0-9_]*)\s*\(/g)) {
    const name = m[1];
    if (scope.has(name)) continue;
    if (/^(View|Text|Pressable|ScrollView|FlatList|Image|ActivityIndicator|StyleSheet|Platform|Animated|Modal|Switch|TextInput|TouchableOpacity|SafeAreaView|KeyboardAvoidingView|Fragment|memo|useState|useEffect|useCallback|useMemo|useRef|useContext|useReducer|useLayoutEffect|useImperativeHandle|forwardRef|createElement)$/.test(name)) continue;
    suspects.push({ file: path.relative(root, file), name });
  }
}

const grouped = new Map();
for (const s of suspects) {
  const key = `${s.file}::${s.name}`;
  grouped.set(key, s);
}

console.log([...grouped.values()].slice(0, 40).map((s) => `${s.file}: ${s.name}`).join('\n'));
