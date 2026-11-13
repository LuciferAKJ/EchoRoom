/**
 * Generates evocative, peaceful anonymous identities for users.
 */
const ADJECTIVES = [
  'Quiet', 'Gentle', 'Misty', 'Silent', 'Wandering', 'Peaceful', 'Serene', 
  'Patient', 'Humble', 'Calm', 'Thoughtful', 'Distant', 'Velvet', 'Midnight',
  'Starlit', 'Amber', 'Shadow', 'Solar', 'Hidden', 'Solitary', 'Kindred'
];

const NOUNS = [
  'Wanderer', 'Echo', 'River', 'Breeze', 'Voyager', 'Sparrow', 'Cloud', 
  'Willow', 'Lantern', 'Compass', 'Shadow', 'Haven', 'Harbor', 'Meadow',
  'Horizon', 'Observer', 'Traveler', 'Seeker', 'Forest', 'Starlight'
];

const PALETTE = [
  '#b4a0e5', // Lavender
  '#8ea4d2', // Periwinkle
  '#e28678', // Warm Coral
  '#4eab8b', // Emerald
  '#e0a05a', // Amber
  '#dc6b7f', // Rose
  '#74a892', // Sage
  '#6b7fd7', // Indigo
];

const generateRandomPseudonym = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj} ${noun} #${num}`;
};

const getRandomAvatarColor = () => {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
};

module.exports = {
  generateRandomPseudonym,
  getRandomAvatarColor,
};
