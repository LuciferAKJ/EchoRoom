/**
 * Semantic styling for EchoRoom's 8 emotion categories.
 * Restrained, calming colors designed for dark midnight surfaces.
 */
export const EMOTIONS = [
  'Happy',
  'Sad',
  'Confused',
  'Frustrated',
  'Hopeful',
  'Lonely',
  'Grateful',
  'Motivated',
];

export const getEmotionStyle = (emotion) => {
  switch (emotion) {
    case 'Hopeful':
      return {
        badge: 'bg-echo-lavender/15 text-echo-lavender border-echo-lavender/30',
        dot: 'bg-echo-lavender',
      };
    case 'Grateful':
      return {
        badge: 'bg-echo-emerald/15 text-echo-emerald border-echo-emerald/30',
        dot: 'bg-echo-emerald',
      };
    case 'Lonely':
      return {
        badge: 'bg-echo-periwinkle/15 text-echo-periwinkle border-echo-periwinkle/30',
        dot: 'bg-echo-periwinkle',
      };
    case 'Frustrated':
      return {
        badge: 'bg-echo-coral/15 text-echo-coral border-echo-coral/30',
        dot: 'bg-echo-coral',
      };
    case 'Sad':
      return {
        badge: 'bg-indigo-400/15 text-indigo-300 border-indigo-400/30',
        dot: 'bg-indigo-400',
      };
    case 'Confused':
      return {
        badge: 'bg-echo-amber/15 text-echo-amber border-echo-amber/30',
        dot: 'bg-echo-amber',
      };
    case 'Happy':
      return {
        badge: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
        dot: 'bg-amber-400',
      };
    case 'Motivated':
      return {
        badge: 'bg-teal-400/15 text-teal-300 border-teal-400/30',
        dot: 'bg-teal-400',
      };
    default:
      return {
        badge: 'bg-echo-surface text-echo-muted border-echo-border',
        dot: 'bg-echo-subtle',
      };
  }
};

/**
 * Format relative date (e.g. 'just now', '20m ago', '3h ago', 'yesterday')
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

