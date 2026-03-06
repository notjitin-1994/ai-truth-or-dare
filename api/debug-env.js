// Ultra-detailed environment variable debugging
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Try every possible way to access the env var
  const results = {
    // Direct access
    direct: {
      KIMI_API_KEY: process.env.KIMI_API_KEY,
      exists: 'KIMI_API_KEY' in process.env,
      keys: Object.keys(process.env).filter(k => k.toLowerCase().includes('kimi')),
    },
    // Case variations
    variations: {
      'KIMI_API_KEY': process.env.KIMI_API_KEY,
      'kimi_api_key': process.env.kimi_api_key,
      'Kimi_Api_Key': process.env.Kimi_Api_Key,
      'kimi-api-key': process.env['kimi-api-key'],
      'KIMI-API-KEY': process.env['KIMI-API-KEY'],
    },
    // All env vars containing 'key'
    all_key_vars: Object.keys(process.env).filter(k => 
      k.toLowerCase().includes('key') || 
      k.toLowerCase().includes('api') ||
      k.toLowerCase().includes('secret')
    ),
    // Total count
    total_env_vars: Object.keys(process.env).length,
    // Vercel specific
    vercel: {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    }
  };

  // Check if any variation has a value
  let foundKey = null;
  for (const [name, value] of Object.entries(results.variations)) {
    if (value) {
      foundKey = { name, length: value.length, preview: value.substring(0, 10) + '...' };
      break;
    }
  }

  res.json({
    ...results,
    found_key: foundKey,
    recommendation: foundKey 
      ? `Found key in variable: ${foundKey.name}. Update code to use this name.`
      : 'No KIMI_API_KEY found. Please double-check Vercel Dashboard > Settings > Environment Variables',
  });
}
