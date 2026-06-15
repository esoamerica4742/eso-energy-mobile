const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { FileStore } = require('metro-cache');
const exclusionList = require('metro-config/private/defaults/exclusionList').default;
const path = require('path');
const os = require('os');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const isWin = os.platform() === 'win32';
const metroCacheRoot = path.join(projectRoot, '.metro-cache');
const fs = require('fs');

if (!isWin) {
  for (const sub of ['bundler', 'haste-map']) {
    fs.mkdirSync(path.join(metroCacheRoot, sub), { recursive: true });
  }
}

/**
 * Windows + monorepo parent folder EMFILE mitigation.
 * Always start dev builds with: npm run start:dev or npm run start:dev:stable
 */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot];
config.projectRoot = projectRoot;
config.maxWorkers = isWin ? 1 : Number(process.env.METRO_MAX_WORKERS) || 2;
config.stickyWorkers = !isWin;

if (isWin) {
  config.cacheStores = [];
  config.resetCache = true;
} else {
  config.cacheStores = [
    new FileStore({
      root: path.join(metroCacheRoot, 'bundler'),
    }),
  ];
  config.fileMapCacheDirectory = path.join(metroCacheRoot, 'haste-map');
}

function escapePath(dir) {
  return dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ignoredOutsideMobile = [
  path.join(workspaceRoot, 'eso-energy-com'),
  path.join(workspaceRoot, 'node_modules'),
].map((p) => new RegExp(`${escapePath(p.replace(/\\/g, '/'))}/.*`));

config.resolver.blockList = exclusionList([
  ...ignoredOutsideMobile,
  /\/\.git\/.*/,
  /\/supabase\/\.temp\/.*/,
  /\/\.expo\/.*/,
  /\/android\/\.gradle\/.*/,
  /\/android\/build\/.*/,
  /\/android\/app\/build\/.*/,
  /\/ios\/build\/.*/,
  /\/ios\/Pods\/.*/,
  /\/coverage\/.*/,
  /\/\.metro-cache\/.*/,
  // Package-root platform folders only — not nested paths like reanimated layoutReanimation/web.
  /\/node_modules\/[^/]+\/(android|ios|macos|windows|tvos|web)(\/|$)/,
]);

config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')];
config.resolver.useWatchman = false;

config.watcher = {
  ...config.watcher,
  healthCheck: {
    enabled: isWin,
    interval: 30000,
    timeout: 10000,
  },
  unstable_lazySha1: true,
  unstable_autoSaveCache: {
    enabled: !isWin,
    debounceMs: 5000,
  },
};

if (isWin) {
  config.watcher.unstable_workerThreads = false;
}

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@supabase/supabase-js') {
    return {
      type: 'sourceFile',
      filePath: path.join(
        __dirname,
        'node_modules/@supabase/supabase-js/dist/index.cjs',
      ),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

const nativeWindConfig = withNativeWind(config, { input: './global.css' });

const originalRewriteRequestUrl = nativeWindConfig.server.rewriteRequestUrl;
nativeWindConfig.server.rewriteRequestUrl = (url) => {
  const rewritten = originalRewriteRequestUrl
    ? originalRewriteRequestUrl(url)
    : url;
  if (typeof rewritten !== 'string') return rewritten;
  return rewritten.replace(
    'unstable_transformProfile=hermes-stable',
    'unstable_transformProfile=default',
  );
};

module.exports = nativeWindConfig;
