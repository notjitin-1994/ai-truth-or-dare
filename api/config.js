// Config endpoint to verify env var setup
import { getApiKey, findPotentialApiKeys } from './_utils.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = getApiKey();
  const potentialKeys = findPotentialApiKeys();
  
  res.json({
    api_key_status: {
      found: !!apiKey,
      source: apiKey ? (process.env.KIMI_API_KEY ? 'KIMI_API_KEY' : 'alternative') : null,
      length: apiKey ? apiKey.length : 0,
      starts_with_sk: apiKey ? apiKey.startsWith('sk-') : false,
      preview: apiKey ? apiKey.substring(0, 15) + '...' : null,
    },
    potential_env_vars: potentialKeys,
    vercel_info: {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    },
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    fix_instructions: [
      "1. Go to https://vercel.com/jitin-nairs-projects/ai-truth-or-dare/settings/environment-variables",
      "2. Check if KIMI_API_KEY exists with value starting with 'sk-kimi-'",
      "3. If it exists, DELETE it and RE-ADD it",
      "4. Make sure 'Production' checkbox is SELECTED",
      "5. Save and REDEPLOY the project",
      "6. If still not working, try adding to 'Preview' environment too"
    ]
  });
}
