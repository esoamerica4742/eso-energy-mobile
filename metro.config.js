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
for (const sub of ['bundler', 'haste-map']) {
  fs.mkdirSync(path.join(metroCacheRoot, sub), { recursive: true });
}

/**
 * Permanent EMFILE mitigation (Windows + monorepo parent folder):
 * - Watch only eso-energy-mobile (not eso-energy-com / parent node_modules)
 * - Project-local Metro cache (not os.tmpdir())
 * - Single bundler worker on Windows
 * - Disable auto-save cache churn on Windows
 *
 * Always start with: npm run start | start:lan | start:phone
 */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot];
config.projectRoot = projectRoot;
config.maxWorkers = isWin ? 1 : Number(process.env.METRO_MAX_WORKERS) || 2;
config.stickyWorkers = !isWin;

config.cacheStores = [
  new FileStore({
    root: path.join(metroCacheRoot, 'bundler'),
  }),
];
config.fileMapCacheDirectory = path.join(metroCacheRoot, 'haste-map');

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
]);

config.resolver.useWatchman = false;

config.watcher = {
  ...config.watcher,
  additionalExclusions: [
    path.join(workspaceRoot, 'eso-energy-com'),
    path.join(workspaceRoot, 'node_modules'),
    path.join(workspaceRoot, '.git'),
    path.join(projectRoot, '.metro-cache'),
    path.join(projectRoot, 'android'),
    path.join(projectRoot, 'ios'),
    path.join(projectRoot, '.expo'),
  ],
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

function escapePath(dir) {
  return dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['require', 'import', 'react-native'];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-reanimated') {
    return {
      type: 'sourceFile',
      filePath: path.join(
        __dirname,
        'node_modules/react-native-reanimated/lib/module/index.js',
      ),
    };
  }
  if (moduleName === '@supabase/supabase-js') {
    return {
      type: 'sourceFile',
      filePath: path.join(
        __dirname,
        'node_modules/@supabase/supabase-js/dist/index.cjs',
      ),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
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
