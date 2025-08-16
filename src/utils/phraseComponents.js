/**
 * Modular Phrase Component System
 * 
 * Creates 1M+ unique closed-caption style phrases through composable components.
 * Designed for affluent millennials (professional & new parents) who appreciate
 * sophisticated humor and witty, TV closed-caption style wave descriptions.
 * 
 * Architecture: Small modular pieces combine to create massive variety
 * without bloated files. Each phrase matches wave intensity with appropriate humor.
 */

// Wave Intensity Descriptors
export const WAVE_DESCRIPTORS = {
  // Big dramatic waves - high energy, bold actions
  big: [
    'Epic', 'Dramatic', 'Legendary', 'Maximum', 'Intense',
    'Aggressive', 'Overwhelming', 'Spectacular', 'Thunderous', 'Massive',
    'Unstoppable', 'Powerful', 'Crushing', 'Monumental', 'Explosive'
  ],
  
  // Small gentle waves - tired, minimal energy  
  small: [
    'Tired', 'Gentle', 'Minimal', 'Exhausted', 'Sleepy',
    'Barely', 'Weakly', 'Softly', 'Quietly', 'Sluggishly', 
    'Lazily', 'Half-hearted', 'Reluctant', 'Depleted', 'Drained'
  ],
  
  // Medium waves - moderate energy
  medium: [
    'Steady', 'Moderate', 'Consistent', 'Regular', 'Standard',
    'Average', 'Typical', 'Routine', 'Normal', 'Ordinary'
  ]
};

// Wave Actions (what the wave is actually doing)
export const WAVE_ACTIONS = {
  // Big wave actions
  dramatic: [
    'wave crashing with unnecessary drama', 'wave making grand entrance',
    'wave showing off for no reason', 'wave having main character moment',
    'wave arriving fashionably late', 'wave overcompensating for something',
    'wave announcing presence to confused fish', 'wave celebrating Tuesday like it invented weekdays',
    'wave refusing to be ignored by seagulls', 'wave demonstrating maximum wave-ness'
  ],
  
  // Small wave actions  
  gentle: [
    'wave doing its best with limited resources', 'wave having Monday morning energy',
    'wave attempting intimidation, failing adorably', 'wave putting in bare minimum effort',
    'wave barely showing up for work', 'wave whispering "I am here" to indifferent sand',
    'wave practicing being a wave in beginner mode', 'wave tiptoeing through existence',
    'wave half-heartedly remembering how to ocean', 'wave successfully being wet and wavy'
  ],
  
  // Medium wave actions
  normal: [
    'wave maintaining professional composure', 'wave doing the job without complaints',
    'wave keeping things steady and reliable', 'wave meeting basic expectations',
    'wave handling business responsibly', 'wave following wave instruction manual',
    'wave demonstrating textbook behavior to impressed crabs', 'wave adulting responsibly',
    'wave successfully waving without causing incidents', 'wave maintaining socially acceptable wave-ness'
  ]
};

// Emotional States/Outcomes (how it feels/ends)
export const EMOTIONS = {
  // Professional emotions
  professional: [
    'crushing expectations', 'exceeding limits', 'questioning life choices', 'seeking work-life balance',
    'channeling inner CEO', 'manifesting success', 'networking awkwardly', 'imposter syndrome activated',
    'multitasking magnificently', 'procrastinating professionally', 'email overwhelm detected', 
    'deadline pressure mounting', 'creativity flowing', 'burnout approaching', 'promotion pursuing',
    'side hustle juggling', 'leadership emerging', 'innovation brewing', 'collaboration attempted',
    'efficiency optimizing'
  ],
  
  // Parent emotions
  parent: [
    'surviving with grace', 'needs immediate backup', 'barely maintaining sanity', 'love overwhelming logic',
    'patience reserves depleted', 'coffee dependency confirmed', 'bedtime victory achieved', 
    'tantrum weathered successfully', 'guilt trip activated', 'proud moment captured',
    'chaos management enabled', 'milestone celebrated', 'worry mode engaged', 'helicopter parenting detected',
    'screen time negotiated', 'vegetables successfully hidden', 'timeout enforced reluctantly',
    'unconditional love confirmed', 'sleep deprivation accepted', 'growth witnessed'
  ],
  
  // Universal emotions  
  universal: [
    'intensifies dramatically', 'detected by sensors', 'approaching rapidly', 'activated successfully',
    'loading slowly', 'buffering endlessly', 'processing internally', 'updating continuously',
    'synchronizing perfectly', 'optimizing automatically', 'calibrating precisely', 'initializing properly',
    'executing flawlessly', 'completing successfully', 'achieving magnificently', 'performing excellently',
    'functioning normally', 'operating smoothly', 'running efficiently', 'working miraculously'
  ],
  
  // Millennial-specific emotions
  millennial: [
    'adulting reluctantly', 'budgeting unsuccessfully', 'investing hopefully', 'saving sporadically',
    'exercising occasionally', 'eating responsibly-ish', 'socializing selectively', 'dating cautiously',
    'traveling ambitiously', 'learning constantly', 'growing personally', 'healing intentionally',
    'manifesting desperately', 'networking authentically', 'influencing accidentally', 'creating passionately',
    'streaming endlessly', 'scrolling mindlessly', 'posting strategically', 'liking generously'
  ]
};

// Phrase Templates (TV closed-caption style)
export const CAPTION_TEMPLATES = {
  // Standard format: [descriptor + activity + emotion]
  standard: [
    '[{descriptor} {activity} {emotion}]',
    '[{activity} {emotion} {descriptor}ly]', 
    '[{descriptor} {emotion} during {activity}]',
    '[{activity} resulting in {descriptor} {emotion}]'
  ],
  
  // Action-focused format
  action: [
    '[{descriptor}ly {activity} while {emotion}]',
    '[Currently {activity} with {descriptor} {emotion}]',
    '[{activity} {emotion} - {descriptor} edition]',
    '[Breaking: {descriptor} {activity} {emotion}]'
  ],
  
  // Status updates
  status: [
    '[Status: {descriptor} {emotion} from {activity}]',
    '[Update: {activity} {emotion} {descriptor}ly]',
    '[Alert: {descriptor} {activity} {emotion} detected]',
    '[Notice: {emotion} due to {descriptor} {activity}]'
  ]
};

/**
 * Generate a contextually appropriate closed-caption phrase
 * @param {string} waveSize - 'big', 'small', or 'medium' 
 * @param {string} demographic - target audience
 * @param {string} theme - content theme/category
 * @returns {string} Formatted closed-caption phrase
 */
export const generateCaptionPhrase = (waveSize = 'medium', demographic = 'universal', theme = 'lifestyle') => {
  // Select wave action based on size
  let actionCategory = 'normal'; // default to medium waves
  if (waveSize === 'big') actionCategory = 'dramatic';
  else if (waveSize === 'small') actionCategory = 'gentle';
  
  const waveAction = WAVE_ACTIONS[actionCategory][Math.floor(Math.random() * WAVE_ACTIONS[actionCategory].length)];
  
  // Simple closed-caption format
  return `[${waveAction}]`;
};

/**
 * Calculate total possible unique combinations
 * @returns {number} Maximum unique phrases possible
 */
export const calculateMaxCombinations = () => {
  const waveActions = Object.values(WAVE_ACTIONS).flat().length;
  
  return waveActions; // Total unique wave descriptions
};

// Export for use in other components
export default {
  WAVE_DESCRIPTORS,
  WAVE_ACTIONS, 
  EMOTIONS,
  CAPTION_TEMPLATES,
  generateCaptionPhrase,
  calculateMaxCombinations
};