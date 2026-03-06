import type { Player, GameSettings, GeneratedQuestion, QuestionType, IntensityLevel } from '@/types/game';

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

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  mild: 'Mild 🌸',
  medium: 'Medium 🔥',
  hot: 'Hot 🌶️',
  extreme: 'Extreme 💀'
};

interface QuestionTemplate {
  content: string;
  instructions: string;
}

const questionTemplates: Record<IntensityLevel, Record<QuestionType, QuestionTemplate[]>> = {
  mild: {
    truth: [
      { content: "What's your biggest turn-on about {targetName}?", instructions: "Be specific and honest. Describe what physically or personality-wise attracts you to them." },
      { content: "What's the most romantic thing you've done for someone?", instructions: "Share a memorable romantic gesture you've made in the past. Include details about the setting and their reaction." },
      { content: "What's your favorite physical feature of {targetName}?", instructions: "Point out and describe the specific body part or feature you find most attractive about them." },
      { content: "What's your idea of a perfect date?", instructions: "Describe your ideal date from start to finish - where you'd go, what you'd do, and how it would end." },
      { content: "Have you ever had a crush on someone in this room?", instructions: "If yes, reveal who and when. If no, describe what type of person in this room you might develop feelings for." },
    ],
    dare: [
      { content: "Give {targetName} a sincere compliment", instructions: "Look them in the eyes and deliver a genuine, heartfelt compliment about their appearance, personality, or something specific you admire about them. Take your time and mean it." },
      { content: "Hold hands with {targetName} for the next 3 rounds", instructions: "Interlock fingers and maintain physical contact. No letting go until 3 full rounds have passed." },
      { content: "Whisper something sweet in {targetName}'s ear", instructions: "Get close, speak softly and slowly, and say something that will make them smile or blush. Only they should hear it." },
      { content: "Give {targetName} a gentle shoulder massage for 30 seconds", instructions: "Stand behind them, place your hands on their shoulders, and apply gentle but firm pressure. Move in slow, circular motions." },
      { content: "Stare into {targetName}'s eyes for 30 seconds without speaking", instructions: "Sit or stand face to face. Look deeply into each other's eyes. No talking, no laughing, just silent eye contact. Set a timer." },
    ],
  },
  medium: {
    truth: [
      { content: "What's your wildest fantasy involving {targetName}?", instructions: "Describe in detail a sexual or romantic scenario you've imagined with them. Be as descriptive as you're comfortable with." },
      { content: "What's the most adventurous place you've been intimate?", instructions: "Share the location and circumstances. What made it exciting or risky? Would you do it again?" },
      { content: "What's something you've always wanted to try but haven't?", instructions: "Reveal a sexual or intimate experience you're curious about but haven't had the chance or courage to explore yet." },
      { content: "What's your favorite type of foreplay?", instructions: "Describe what gets you in the mood. Be specific about actions, touches, or scenarios that work best for you." },
      { content: "Have you ever sent nudes? To whom?", instructions: "Be honest about your experience with sharing intimate photos. If yes, share the context without being too explicit." },
    ],
    dare: [
      { content: "Kiss {targetName}'s neck for 10 seconds", instructions: "Get close, tilt their head slightly, and press your lips to their neck. Use gentle suction and move slowly. Count to 10." },
      { content: "Remove one item of clothing", instructions: "Choose one piece of clothing and remove it completely. You choose which item based on your comfort level." },
      { content: "Give {targetName} a passionate kiss on the lips", instructions: "Pull them close, make full lip contact, and hold for at least 5 seconds. Make it count." },
      { content: "Let {targetName} blindfold you for the next round", instructions: "Allow them to cover your eyes with a cloth, tie, or blindfold. You must remain blindfolded until the next round ends." },
      { content: "Sit on {targetName}'s lap for the next 2 rounds", instructions: "Position yourself comfortably on their lap, facing them or away. Stay there for 2 full rounds of gameplay." },
    ],
  },
  hot: {
    truth: [
      { content: "Describe in detail what you'd do to {targetName} if you were alone", instructions: "Paint a vivid picture of exactly how you'd seduce and pleasure them. Be explicit about your intentions and actions." },
      { content: "What's the most extreme thing you've done sexually?", instructions: "Share your most boundary-pushing sexual experience. Don't hold back on the details." },
      { content: "Have you ever been in a threesome? Would you?", instructions: "Share your experience if you've had one, or describe your ideal threesome scenario if you haven't." },
      { content: "What's your darkest sexual fantasy?", instructions: "Reveal the fantasy you think about but might be too afraid to actually try. Be completely honest." },
      { content: "What's something you've done that you'd never tell your parents?", instructions: "Share a sexual experience or act that would shock or disappoint your family if they knew." },
    ],
    dare: [
      { content: "Perform a striptease for {targetName} (down to underwear)", instructions: "Put on music, stand before them, and slowly remove your clothes one piece at a time. Tease, make eye contact, and end in underwear only." },
      { content: "Let {targetName} handcuff you (or pretend to) for 2 rounds", instructions: "Allow them to restrain your wrists. You must remain 'cuffed' and under their control for 2 full rounds." },
      { content: "Kiss {targetName} passionately for 30 seconds", instructions: "Full makeout session - lips, tongue, hands exploring. Set a timer and don't stop until it goes off." },
      { content: "Let {targetName} control your movements for 1 minute", instructions: "They can position you however they want, move your body, guide your hands. You are their puppet for 60 seconds." },
      { content: "Give {targetName} oral pleasure through clothing for 30 seconds", instructions: "Kneel or position yourself at their groin. Use your mouth on their clothed genitals - pressure, warmth, movement." },
    ],
  },
  extreme: {
    truth: [
      { content: "What's the most illegal thing you've done during sex?", instructions: "Share a sexual act that technically broke a law - public indecency, age issues, location-based crimes, etc. Be honest." },
      { content: "Have you ever had sex with multiple people in one day?", instructions: "Tell the story of your most sexually active day. Who, when, where, and how did you manage it?" },
      { content: "What's the most fucked up fantasy you've had about {targetName}?", instructions: "Reveal a dark, taboo, or extreme fantasy involving them that you've never shared before." },
      { content: "Have you ever done something sexual you deeply regret?", instructions: "Share an experience that still bothers you, something you wish you could take back." },
      { content: "What's the most degrading thing you'd let {targetName} do to you?", instructions: "Describe your absolute limit of what you'd allow them to do - how far you'd go in submission." },
    ],
    dare: [
      { content: "Have sex (simulated) with {targetName} for 2 minutes", instructions: "Simulate intercourse as realistically as possible with clothes on. Position, thrusting, sounds, the full experience." },
      { content: "Let {targetName} do whatever they want to you for 3 minutes", instructions: "Complete submission - they can touch, kiss, position, or pleasure you however they desire within your hard limits." },
      { content: "Give {targetName} actual oral pleasure for 1 minute", instructions: "Perform real oral sex on them through or under clothing, or on bare skin if consented. Make it pleasurable for them." },
      { content: "Strip completely naked and stay naked for 3 rounds", instructions: "Remove every piece of clothing and remain fully nude for 3 complete rounds of gameplay." },
      { content: "Let {targetName} dominate you completely for 2 minutes", instructions: "They are in total control - commands, positioning, pleasure, denial. Submit fully to their will." },
    ],
  },
};

function personalizeQuestion(template: QuestionTemplate, player: Player, target: Player): QuestionTemplate {
  let content = template.content;
  let instructions = template.instructions;
  
  content = content.replace(/{playerName}/g, player.name);
  content = content.replace(/{targetName}/g, target.name);
  instructions = instructions.replace(/{playerName}/g, player.name);
  instructions = instructions.replace(/{targetName}/g, target.name);
  
  if (player.notes && Math.random() > 0.7) {
    const noteHints = player.notes.split(',').map(n => n.trim()).filter(n => n);
    if (noteHints.length > 0) {
      const randomNote = noteHints[Math.floor(Math.random() * noteHints.length)];
      content += ` (Hint: I know you're into ${randomNote})`;
    }
  }
  
  if (player.physicalFeatures.distinguishingFeatures && Math.random() > 0.8) {
    content += ` Show off that ${player.physicalFeatures.distinguishingFeatures}!`;
  }
  
  return { content, instructions };
}

function selectTargetPlayer(
  player: Player,
  allPlayers: Player[],
  settings: GameSettings
): Player | null {
  const eligiblePlayers = allPlayers.filter(p => {
    if (p.id === player.id) return false;
    if (p.gender === player.gender && !settings.includeSameGenderDares) return false;
    if (p.gender !== player.gender && !settings.includeCrossGenderDares) return false;
    return true;
  });
  
  if (eligiblePlayers.length === 0) {
    return allPlayers.find(p => p.id !== player.id) || null;
  }
  
  return eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
}

export function generateQuestion(
  player: Player,
  allPlayers: Player[],
  type: QuestionType,
  settings: GameSettings
): GeneratedQuestion {
  const templates = questionTemplates[settings.intensityLevel][type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const target = selectTargetPlayer(player, allPlayers, settings);
  if (!target) {
    throw new Error('No eligible target player found');
  }
  
  const personalized = personalizeQuestion(template, player, target);
  
  return {
    id: generateId(),
    type,
    content: personalized.content,
    instructions: personalized.instructions,
    targetPlayerId: target.id,
    sourcePlayerId: player.id,
    intensity: settings.intensityLevel,
    category: settings.categories[Math.floor(Math.random() * settings.categories.length)],
    createdAt: Date.now(),
  };
}

export function getIntensityDescription(level: IntensityLevel): string {
  const descriptions: Record<IntensityLevel, string> = {
    mild: 'Flirty and romantic - perfect for breaking the ice',
    medium: 'Sexual and suggestive - things are heating up',
    hot: 'Explicit and intense - for adventurous players',
    extreme: 'No limits - only for the fearless',
  };
  return descriptions[level];
}
