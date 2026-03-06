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
    
    console.log('Test API Key check:', apiKey ? `Found (${apiKey.length} chars)` : 'Not found');

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
    
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    console.log('Request URL:', KIMI_API_URL);

    const requestBody = {
      model: 'kimi-for-coding',
      messages: [
        { role: 'user', content: 'Say "Connection successful" and nothing else.' }
      ],
      max_tokens: 50,
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers), null, 2));

    const responseText = await response.text();
    console.log('Response body (raw):', responseText);

    if (!response.ok) {
      console.error('Kimi API Error:', response.status, responseText);
      return res.status(response.status).json({ 
        success: false,
        error: `Kimi API error: ${response.status}`,
        url: KIMI_API_URL,
        response_body: responseText,
      });
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return res.json({
        success: false,
        error: 'Invalid JSON response',
        raw_response: responseText,
      });
    }
    
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      res.json({ success: true, message: content });
    } else {
      res.json({ 
        success: false, 
        error: 'Empty content in response',
        full_response: data,
      });
    }
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Proxy server error',
      message: error.message,
      stack: error.stack,
    });
  }
}
