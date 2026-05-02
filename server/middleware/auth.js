const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Strict authentication – blocks request if token is missing or invalid.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[auth] Token verification failed:', err.message);
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  });
};

/**
 * Optional authentication – attaches user if token is valid, but allows
 * the request through regardless. Use for endpoints where auth is nice
 * to have but not required (e.g. AI chat proxy).
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[auth] Optional token invalid, proceeding anyway:', err.message);
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  optionalAuth,
  JWT_SECRET
};
