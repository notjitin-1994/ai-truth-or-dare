// Simple health check endpoint
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      kimi_key_exists: !!process.env.KIMI_API_KEY
    }
  });
}
