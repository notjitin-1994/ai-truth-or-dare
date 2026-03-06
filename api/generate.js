// Vercel Serverless Function for AI generation
import { getApiKey, findPotentialApiKeys, KIMI_API_URL } from './_utils.js';

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
    const { messages, model, temperature, max_tokens, apiKey: bodyApiKey } = req.body;
    
    // Try multiple sources for API key
    let apiKey = getApiKey();
    
    // DEBUG: Log all attempts
    console.log('DEBUG: Trying to get API key');
    console.log('DEBUG: getApiKey result:', apiKey ? 'Found (' + apiKey.length + ' chars)' : 'Not found');
    console.log('DEBUG: process.env.KIMI_API_KEY:', process.env.KIMI_API_KEY ? 'Exists' : 'Missing');
    console.log('DEBUG: All env vars:', Object.keys(process.env));
    
    // TEMPORARY FALLBACK: Allow API key in request body for testing
    // WARNING: This is insecure and should only be used for debugging!
    if (!apiKey && bodyApiKey) {
      console.log('DEBUG: Using API key from request body (INSECURE - for debugging only)');
      apiKey = bodyApiKey;
    }

    if (!apiKey) {
      const potentialKeys = findPotentialApiKeys();
      
      return res.status(401).json({ 
        error: 'KIMI_API_KEY environment variable not set',
        debug: {
          potential_api_keys_found: potentialKeys,
          total_env_vars: Object.keys(process.env).length,
          vercel_env: process.env.VERCEL_ENV,
          node_env: process.env.NODE_ENV,
          kimi_key_in_env: 'KIMI_API_KEY' in process.env,
          all_env_vars: Object.keys(process.env),
        },
        manual_fix_url: 'https://vercel.com/jitin-nairs-projects/ai-truth-or-dare/settings/environment-variables',
        fix_steps: [
          "1. Go to Vercel Dashboard > Settings > Environment Variables",
          "2. Check if KIMI_API_KEY exists (case sensitive!)",
          "3. If not, add: KIMI_API_KEY=sk-kimi-vTAdfc...",
          "4. Select: Production",
          "5. Save and Redeploy (without cache)",
          "6. Check /api/debug-env to verify"
        ],
        temp_workaround: 'For testing only, you can pass apiKey in the request body'
      });
    }

    const response = await fetch(KIMI_API_URL, {
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
      console.error('Kimi API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Kimi API error: ${response.status}`,
        url: KIMI_API_URL,
        details: errorText.substring(0, 500)
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
