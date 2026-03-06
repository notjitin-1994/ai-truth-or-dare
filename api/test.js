// Vercel Serverless Function for testing API connection
import { getApiKey, findPotentialApiKeys } from './_utils.js';

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

  // Allow GET for easier testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key using utility (tries multiple sources)
    let apiKey = getApiKey();
    
    // DEBUG: Log all environment variables to console
    console.log('=== ENV VAR DEBUG ===');
    console.log('All env vars:', Object.keys(process.env));
    console.log('KIMI_API_KEY exists:', !!process.env.KIMI_API_KEY);
    console.log('KIMI_API_KEY length:', process.env.KIMI_API_KEY?.length);
    console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
    console.log('=== END DEBUG ===');

    if (!apiKey) {
      const potentialKeys = findPotentialApiKeys();
      
      return res.status(401).json({ 
        success: false,
        error: 'KIMI_API_KEY environment variable not set',
        debug: {
          potential_api_keys_found: potentialKeys,
          total_env_vars: Object.keys(process.env).length,
          vercel_env: process.env.VERCEL_ENV,
          node_env: process.env.NODE_ENV,
          kimi_key_raw_exists: !!process.env.KIMI_API_KEY,
          kimi_key_raw_type: typeof process.env.KIMI_API_KEY,
        },
        hint: 'VERCEL_ENV_VAR_BUG: The env var is set in dashboard but not reaching the function. Try:\n1. Go to Project Settings → Environment Variables\n2. DELETE the KIMI_API_KEY completely\n3. Add it back with EXACT name: KIMI_API_KEY\n4. Select ALL environments (Production, Preview, Development)\n5. Click Save\n6. Trigger a NEW deployment (not redeploy)',
        workaround: 'If this keeps failing, the API key can be temporarily hardcoded for testing (not recommended for production)'
      });
    }

    const response = await fetch(KIMI_CODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-0711-preview',
        messages: [
          { role: 'user', content: 'Say "Connection successful" and nothing else.' }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        success: false,
        error: `Kimi API error: ${response.status}`,
        details: errorText 
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      res.json({ success: true, message: 'Connection successful! AI is ready.' });
    } else {
      res.json({ success: false, message: 'Empty response from API' });
    }
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Proxy server error',
      message: error.message 
    });
  }
}
