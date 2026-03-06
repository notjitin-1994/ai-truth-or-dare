// Kimi Code API Configuration
// For keys from https://www.kimi.com/code/console
// Note: Kimi Code requires specific headers to identify as a coding agent

export const KIMI_API_URL = 'https://api.kimi.com/coding/v1/chat/completions';

// Headers required to identify as a coding agent (like Claude Code)
export function getKimiHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    // These headers identify us as a coding agent
    'User-Agent': 'claude-code/0.1.0',
    'X-Client-Name': 'claude-code',
    'X-Client-Version': '0.1.0',
    'Accept': 'application/json',
  };
}

// Utility to get API key from environment
export function getApiKey() {
  const key = process.env.KIMI_API_KEY?.trim();
  if (key) return key;
  
  // Try alternatives
  const alternatives = [
    process.env.KIMI_API_KEY,
    process.env.ANTHROPIC_AUTH_TOKEN,
    process.env.ANTHROPIC_API_KEY,
    process.env.MOONSHOT_API_KEY,
  ];
  
  for (const k of alternatives) {
    if (k?.trim()) return k.trim();
  }
  
  return null;
}

// For debugging - list all env vars that might contain API keys
export function findPotentialApiKeys() {
  return Object.keys(process.env).filter(key => {
    const lower = key.toLowerCase();
    return lower.includes('kimi') || 
           lower.includes('api') || 
           lower.includes('key') ||
           lower.includes('secret') ||
           lower.includes('token') ||
           lower.includes('anthropic') ||
           lower.includes('moonshot');
  });
}
