// Vercel Serverless Function for AI generation
// Kimi API endpoint - using OpenAI-compatible endpoint
const KIMI_CODE_API_URL = 'https://api.kimi.com/v1/chat/completions';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model, temperature, max_tokens } = req.body;
    // Trim the API key to handle any accidental whitespace
    const apiKey = process.env.KIMI_API_KEY?.trim();

    if (!apiKey) {
      const allKeys = Object.keys(process.env);
      const kimiRelated = allKeys.filter(k => k.toLowerCase().includes('kimi'));
      
      return res.status(401).json({ 
        error: 'KIMI_API_KEY environment variable not set',
        debug: {
          kimi_related_keys_found: kimiRelated,
          total_env_vars: allKeys.length,
          vercel_env: process.env.VERCEL_ENV,
          node_env: process.env.NODE_ENV,
        },
        hint: 'Please set KIMI_API_KEY in Vercel Dashboard > Project Settings > Environment Variables. Then REDEPLOY.'
      });
    }

    const response = await fetch(KIMI_CODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'kimi-k2-0711-preview',
        messages,
        temperature: temperature || 0.9,
        max_tokens: max_tokens || 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Kimi API error: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy server error',
      message: error.message 
    });
  }
}
