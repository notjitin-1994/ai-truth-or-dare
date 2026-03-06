import type { Player, GameSettings, GeneratedQuestion, QuestionType } from '@/types/game';

const PROXY_API_URL = '/api/generate';
const PROXY_TEST_URL = '/api/test';

// Get a unique ID that works across all browsers
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function testApiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(PROXY_TEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.error || `Server error: ${response.status}` };
    }

    const data = await response.json();
    if (data.success) {
      return { success: true, message: data.message || 'Connection successful!' };
    } else {
      return { success: false, message: data.error || data.message || data.details || 'Connection failed' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Connection failed: ${errorMessage}` };
  }
}

const SYSTEM_PROMPT = `You are an AI Truth or Dare generator for an adults-only party game. Create personalized, provocative truths or dares based on player profiles.

## OUTPUT FORMAT
Respond ONLY with a JSON object:
{
  "content": "The truth question or dare statement",
  "instructions": "Detailed step-by-step instructions",
  "category": "one of: romantic, physical, revealing, fantasy, roleplay, group, personal, naughty, taboo"
}

## INTENSITY LEVELS
- mild: Flirty, romantic, suggestive
- medium: Sexual themes, intimate questions, suggestive physical contact
- hot: Explicitly sexual, nudity, erotic scenarios
- extreme: No-holds-barred, taboo, boundary-pushing

Make it personal using player names, physical features, and kinks from their profiles.`;

interface AIQuestionResponse {
  content: string;
  instructions: string;
  category: string;
}

export async function generateAIQuestion(
  player: Player,
  targetPlayer: Player,
  allPlayers: Player[],
  type: QuestionType,
  settings: GameSettings
): Promise<GeneratedQuestion> {
  const otherPlayers = allPlayers.filter(p => p.id !== player.id && p.id !== targetPlayer.id);

  const userPrompt = `Generate a ${type} at ${settings.intensityLevel} intensity level.

CURRENT PLAYER: ${player.name} (${player.gender}, ${player.relationshipStatus})
Notes: ${player.notes || 'None'}

TARGET PLAYER: ${targetPlayer.name} (${targetPlayer.gender}, ${targetPlayer.relationshipStatus})
Notes: ${targetPlayer.notes || 'None'}

OTHER PLAYERS: ${otherPlayers.map(p => p.name).join(', ') || 'None'}

Generate a unique, creative ${type} specifically tailored for ${player.name} to ${type === 'dare' ? 'perform on' : 'answer about'} ${targetPlayer.name}.`;

  const response = await fetch(PROXY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kimi-for-coding',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 10000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from AI');
  }

  let parsed: AIQuestionResponse;
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(content);
    }
  } catch (e) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid response format from AI');
  }

  return {
    id: generateId(),
    type,
    content: parsed.content,
    instructions: parsed.instructions,
    targetPlayerId: targetPlayer.id,
    sourcePlayerId: player.id,
    intensity: settings.intensityLevel,
    category: parsed.category || settings.categories[0],
    createdAt: Date.now(),
  };
}

export { generateQuestion as generateTemplateQuestion } from './questionGenerator';
