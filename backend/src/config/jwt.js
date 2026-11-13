/**
 * Strict JWT Secret Provider
 * Requires a configured JWT_SECRET environment variable.
 * Rejects missing secrets in all environments, and strictly rejects weak,
 * short (<32 chars), or placeholder secrets in production mode.
 */
const WEAK_PATTERNS = [
  'replace_with',
  'change_in_production',
  'placeholder',
  'secret',
  'default',
  'password',
  '123456',
  'echoroom_jwt',
];

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is not configured. The application cannot operate securely.'
    );
  }

  const trimmed = secret.trim();

  // In production, reject weak, short, or placeholder secrets
  if (process.env.NODE_ENV === 'production') {
    if (trimmed.length < 32) {
      throw new Error(
        'FATAL: In production, JWT_SECRET must be at least 32 characters long to ensure cryptographic security.'
      );
    }

    const lower = trimmed.toLowerCase();
    const isWeak = WEAK_PATTERNS.some((pattern) => lower.includes(pattern));
    if (isWeak) {
      throw new Error(
        'FATAL: In production, JWT_SECRET cannot be a default or placeholder value. Generate a random high-entropy secret.'
      );
    }
  }

  return trimmed;
};

module.exports = {
  getJwtSecret,
};

