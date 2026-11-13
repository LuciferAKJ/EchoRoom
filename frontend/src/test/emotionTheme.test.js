import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EMOTIONS, getEmotionStyle, formatRelativeTime } from '../utils/emotionTheme.js';

describe('Utils: emotionTheme', () => {
  it('contains exactly the 8 canonical emotions', () => {
    const expectedEmotions = [
      'Happy',
      'Sad',
      'Confused',
      'Frustrated',
      'Hopeful',
      'Lonely',
      'Grateful',
      'Motivated',
    ];
    assert.deepEqual(EMOTIONS, expectedEmotions);
  });

  it('provides badge and dot styling for each canonical emotion', () => {
    EMOTIONS.forEach((emotion) => {
      const style = getEmotionStyle(emotion);
      assert.ok(style);
      assert.equal(typeof style.badge, 'string');
      assert.equal(typeof style.dot, 'string');
      assert.ok(style.badge.length > 0);
      assert.ok(style.dot.length > 0);
    });
  });

  it('formats relative timestamps correctly', () => {
    const now = new Date();
    assert.equal(formatRelativeTime(now.toISOString()), 'just now');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    assert.equal(formatRelativeTime(twoHoursAgo.toISOString()), '2h ago');
  });
});
