// Vercel Serverless Function for testing API connection
import { getApiKey, findPotentialApiKeys, KIMI_API_URL, getKimiHeaders } from './_utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = getApiKey();
    
    console.log('Test API Key check:', apiKey ? 'Found' : 'Not found');

    if (!apiKey) {
      const potentialKeys = findPotentialApiKeys();
      
      return res.status(401).json({ 
        success: false,
        error: 'KIMI_API_KEY environment variable not set',
        debug: {
          potential_api_keys_found: potentialKeys,
          total_env_vars: Object.keys(process.env).length,
        },
        hint: 'Add KIMI_API_KEY to Vercel environment variables'
      });
    }

    // Use Kimi-specific headers to identify as coding agent
    const headers = getKimiHeaders(apiKey);

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'kimi-for-coding',
        messages: [
          { role: 'user', content: 'Say "Connection successful" and nothing else.' }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kimi API Error:', response.status, errorText);
      return res.status(response.status).json({ 
        success: false,
        error: `Kimi API error: ${response.status}`,
        url: KIMI_API_URL,
        details: errorText.substring(0, 500)
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
