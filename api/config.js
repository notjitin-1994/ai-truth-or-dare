// Config endpoint to verify env var setup
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get all environment variables that might be related
  const allEnvVars = Object.keys(process.env);
  
  // Look for any variations of the API key name
  const possibleKeyNames = allEnvVars.filter(key => 
    key.toLowerCase().includes('kimi') || 
    key.toLowerCase().includes('api') ||
    key.toLowerCase().includes('key')
  );

  // Check the exact KIMI_API_KEY
  const kimiKey = process.env.KIMI_API_KEY;
  
  res.json({
    kimi_api_key: {
      exists: !!kimiKey,
      length: kimiKey ? kimiKey.length : 0,
      starts_with_sk: kimiKey ? kimiKey.startsWith('sk-') : false,
      first_10_chars: kimiKey ? kimiKey.substring(0, 10) + '...' : null,
      trimmed_exists: !!(kimiKey && kimiKey.trim()),
      trimmed_length: kimiKey ? kimiKey.trim().length : 0,
    },
    possible_env_vars: possibleKeyNames,
    all_env_var_count: allEnvVars.length,
    vercel_specific: {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    },
    node_env: process.env.NODE_ENV,
    timestamp: Date.now(),
  });
}
