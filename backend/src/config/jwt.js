/**
 * Strict JWT Secret Provider
 * Requires a configured JWT_SECRET environment variable.
 * Throws a fatal error if JWT_SECRET is missing.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is not configured. The application cannot operate securely.'
    );
  }
  return secret.trim();
};

module.exports = {
  getJwtSecret,
};
