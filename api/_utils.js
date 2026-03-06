// Kimi API Configuration
export const KIMI_API_URL = 'https://api.kimi.com/v1/chat/completions';

// Utility to get API key from various sources
export function getApiKey() {
  // Try environment variable first (normal case)
  const envKey = process.env.KIMI_API_KEY?.trim();
  if (envKey) return envKey;
  
  // Try alternative env var names (sometimes Vercel prefixes or renames)
  const alternatives = [
    process.env.KIMI_API_KEY,
    process.env.VERCEL_KIMI_API_KEY,
    process.env.NEXT_PUBLIC_KIMI_API_KEY,
    process.env.KIMI_KEY,
    process.env.OPENAI_API_KEY,
  ];
  
  for (const key of alternatives) {
    if (key?.trim()) return key.trim();
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
           lower.includes('token');
  });
}
