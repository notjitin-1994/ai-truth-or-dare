// Vercel Serverless Function for testing API connection
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
    // Trim the API key to handle any accidental whitespace
    const apiKey = process.env.KIMI_API_KEY?.trim();

    if (!apiKey) {
      console.error('KIMI_API_KEY is not set or empty. Available env keys:', 
        Object.keys(process.env).filter(k => k.includes('KIMI') || k.includes('API'))
      );
      return res.status(401).json({ 
        success: false,
        error: 'KIMI_API_KEY environment variable not set',
        hint: 'Please set KIMI_API_KEY in your Vercel project settings under Environment Variables'
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
