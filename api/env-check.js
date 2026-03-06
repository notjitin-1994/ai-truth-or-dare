// Comprehensive environment variable check
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Get ALL environment variables (including system ones)
  const allVars = Object.keys(process.env).sort();
  
  // Check for any value that looks like an API key
  const apiKeyLikeValues = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (value && (
      value.startsWith('sk-') || 
      value.startsWith('pk-') || 
      value.startsWith('Bearer') ||
      key.toLowerCase().includes('key')
    )) {
      apiKeyLikeValues.push({
        key: key,
        preview: value ? value.substring(0, 10) + '...' : 'empty',
        length: value?.length || 0
      });
    }
  }
  
  // Check specific variations
  const variations = [
    'KIMI_API_KEY',
    'kimi_api_key',
    'KIMI_KEY',
    'OPENAI_API_KEY',
    'VERCEL_KIMI_API_KEY',
    'NEXT_PUBLIC_KIMI_API_KEY',
    'KIMI_APIKEY',
    'KIMI-API-KEY'
  ];
  
  const variationResults = {};
  for (const v of variations) {
    const val = process.env[v];
    variationResults[v] = {
      exists: !!val,
      length: val?.length || 0,
      trimmed: !!(val?.trim()),
      preview: val ? val.substring(0, 15) + '...' : null
    };
  }
  
  res.json({
    total_env_vars: allVars.length,
    all_var_names: allVars,
    api_key_like_values: apiKeyLikeValues,
    kimi_variations: variationResults,
    specific_check: {
      KIMI_API_KEY_raw: process.env.KIMI_API_KEY ? 'EXISTS' : 'NOT FOUND',
      KIMI_API_KEY_type: typeof process.env.KIMI_API_KEY,
      KIMI_API_KEY_length: process.env.KIMI_API_KEY?.length || 0,
    },
    vercel: {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    }
  });
}
