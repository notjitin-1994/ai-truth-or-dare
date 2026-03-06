// Vercel Serverless Function for AI generation
import { findPotentialApiKeys, KIMI_API_URL } from './_utils.js';

// Direct env var access - bypass any utility issues
function getApiKeyDirect() {
  // Check directly without any utility function
  const key = process.env.KIMI_API_KEY;
  console.log('Direct check - KIMI_API_KEY type:', typeof key);
  console.log('Direct check - KIMI_API_KEY length:', key?.length);
  console.log('Direct check - KIMI_API_KEY has value:', !!key);
  return key?.trim() || null;
}

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
    
    // Direct env var access
    const apiKey = getApiKeyDirect();
    
    console.log('API Key check result:', apiKey ? 'FOUND' : 'NOT FOUND');

    if (!apiKey) {
      const potentialKeys = findPotentialApiKeys();
      
      return res.status(401).json({ 
        error: 'KIMI_API_KEY environment variable not set',
        debug: {
          potential_api_keys_found: potentialKeys,
          direct_check: {
            'KIMI_API_KEY in process.env': 'KIMI_API_KEY' in process.env,
            'typeof': typeof process.env.KIMI_API_KEY,
            'length': process.env.KIMI_API_KEY?.length,
            'value_preview': process.env.KIMI_API_KEY ? process.env.KIMI_API_KEY.substring(0, 15) + '...' : null,
          },
          total_env_vars: Object.keys(process.env).length,
        },
        note: 'If debug-env shows the key but this shows null, there is a deployment caching issue. Try force redeploy.'
      });
    }

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'kimi-for-coding', // Kimi Code model ID
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
