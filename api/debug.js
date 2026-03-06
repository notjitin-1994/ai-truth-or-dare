// Debug endpoint to check environment variables (safely)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check various environment variable patterns
  const envInfo = {
    kimi_key_exists: !!process.env.KIMI_API_KEY,
    kimi_key_length: process.env.KIMI_API_KEY ? process.env.KIMI_API_KEY.length : 0,
    kimi_key_prefix: process.env.KIMI_API_KEY ? process.env.KIMI_API_KEY.substring(0, 10) + '...' : null,
    kimi_key_starts_with_sk: process.env.KIMI_API_KEY ? process.env.KIMI_API_KEY.startsWith('sk-') : false,
    all_env_keys: Object.keys(process.env).filter(key => 
      !key.includes('VERCEL') && 
      !key.includes('PATH') && 
      !key.includes('NODE')
    ),
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
  };

  res.json(envInfo);
}
