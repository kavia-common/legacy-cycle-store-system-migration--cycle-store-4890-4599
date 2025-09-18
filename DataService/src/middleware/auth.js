'use strict';
const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and attach user to request.
 * Supports either a symmetric JWT_SECRET or an asymmetric JWT_PUBLIC_KEY_BASE64.
 */
function getVerifier() {
  const publicKeyB64 = process.env.JWT_PUBLIC_KEY_BASE64;
  const secret = process.env.JWT_SECRET;
  if (publicKeyB64) {
    const publicKey = Buffer.from(publicKeyB64, 'base64').toString('utf-8');
    return { key: publicKey, options: { algorithms: ['RS256'] } };
  }
  if (secret) {
    return { key: secret, options: { algorithms: ['HS256'] } };
  }
  return null;
}

// PUBLIC_INTERFACE
function authenticate(req, res, next) {
  /** Authenticate requests using JWT in Authorization: Bearer header. */
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Missing token' } });

  const verifier = getVerifier();
  if (!verifier) {
    return res.status(500).json({ status: 'error', error: { code: 'SERVER_CONFIG', message: 'JWT verification not configured' } });
  }

  try {
    const payload = jwt.verify(token, verifier.key, verifier.options);
    req.user = { id: payload.sub || payload.id || 'unknown', roles: payload.roles || [] };
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
}

// PUBLIC_INTERFACE
function requireRoles(...roles) {
  /** Enforce that the authenticated user has any of the specified roles. */
  return (req, res, next) => {
    const userRoles = (req.user && req.user.roles) || [];
    if (roles.length === 0) return next();
    const allowed = userRoles.some(r => roles.includes(r));
    if (!allowed) {
      return res.status(403).json({ status: 'error', error: { code: 'FORBIDDEN', message: 'Insufficient role' } });
    }
    return next();
  };
}

module.exports = { authenticate, requireRoles };
