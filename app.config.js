const fs = require('fs');
const path = require('path');

/** Read .env into a map (always from file — reliable for Expo Go on physical devices). */
function readEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const out = {};
  if (!fs.existsSync(envPath)) return out;

  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
    process.env[key] = value;
  }
  return out;
}

/** @param {import('expo/config').ConfigContext} ctx */
module.exports = ({ config }) => {
  const env = readEnvFile();

  const supabaseUrl = (env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
  const supabaseAnonKey = (env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
  const easProjectId = (
    env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    config.extra?.eas?.projectId ??
    '3977eea0-ade4-440d-9ee0-d0ff1a8bb79f'
  ).trim();
  const apiBase = supabaseUrl.replace(/\/$/, '');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[ESO Energy] Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env, then: npx expo start -c',
    );
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      supabaseUrl,
      supabaseAnonKey,
      webAppUrl: env.EXPO_PUBLIC_WEB_APP_URL ?? supabaseUrl,
      enodeApiUrl:
        env.EXPO_PUBLIC_ENODE_API_URL ??
        (apiBase ? `${apiBase}/functions/v1/enode-api` : ''),
      enodeRedirectUri:
        env.EXPO_PUBLIC_ENODE_REDIRECT_URI ?? 'esoenergymobile://link-device/callback',
      solarmanApiUrl:
        env.EXPO_PUBLIC_SOLARMAN_API_URL ??
        (apiBase ? `${apiBase}/functions/v1/solarman-api` : ''),
      esoPayApiUrl:
        env.ESO_PAY_API_BASE_URL ??
        env.EXPO_PUBLIC_ESO_PAY_API_URL ??
        (apiBase ? `${apiBase}/functions/v1/eso-pay-api` : ''),
      easProjectId,
      eas: {
        projectId: easProjectId,
      },
    },
  };
};
