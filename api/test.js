// Vercel Serverless Function for testing API connection
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
        manual_fix_steps: [
          "1. Go to https://vercel.com/jitin-nairs-projects/ai-truth-or-dare/settings/environment-variables",
          "2. Click 'Add' button",
          "3. Name: KIMI_API_KEY",
          "4. Value: sk-kimi-vTAdfcInXuPfEl6fblnh76Zr3Zxo2c81XdMgtphZJjFHHeKgmYBWlChFYk7h2fHw",
          "5. Environment: Select ONLY 'Production' (uncheck others)",
          "6. Click 'Save'",
          "7. Go to Deployments tab",
          "8. Click three dots [...] on latest deployment",
          "9. Click 'Redeploy' and select 'Use existing Build Cache: NO'",
          "10. Wait for redeploy to complete"
        ],
        note: 'Vercel CLI is timing out. Please use the Dashboard to set the env var manually.'
      });
    }

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-for-coding', // Kimi Code model ID
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
      message: error.message,
      note: 'If you see 404 error, the Kimi API endpoint may have changed. Contact Kimi support or check their documentation.'
    });
  }
}
