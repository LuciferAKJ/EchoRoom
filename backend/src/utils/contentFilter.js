/**
 * Basic safety and heuristic keyword scanner for EchoRoom.
 * NOTE: Heuristic text filtering does NOT guarantee 100% detection of harmful content.
 * It serves as an assistive automated triage flagging tool for human moderators.
 */

const HARMFUL_PATTERNS = [
  /\bkill\s+yourself\b/i,
  /\bcommit\s+suicide\b/i,
  /\bhang\s+yourself\b/i,
  /\bracist\b/i,
  /\bterrorist\b/i,
  /\bhate\s+all\b/i,
  /\bviagra\b/i,
  /\bfree\s+crypto\b/i,
  /\bcasino\s+bonus\b/i,
];

const scanContentForSafety = (text) => {
  if (!text || typeof text !== 'string') {
    return { isFlagged: false, reasons: [] };
  }

  const detected = [];
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(text)) {
      detected.push(`Pattern match: ${pattern.source}`);
    }
  }

  return {
    isFlagged: detected.length > 0,
    reasons: detected,
  };
};

module.exports = {
  scanContentForSafety,
};

