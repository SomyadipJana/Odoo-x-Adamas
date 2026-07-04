import jwt from 'jsonwebtoken';

const JWT_SECRET = 'hrms_jwt_secret_key_2024';

/**
 * Generate a JWT token with 24-hour expiry.
 * @param {Object} payload - Data to encode in the token
 * @returns {string} Signed JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Authentication middleware.
 * Extracts and verifies Bearer token from the Authorization header.
 * Attaches decoded user info to req.user.
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user data to the request
    req.user = {
      id: decoded.id,
      userId: decoded.userId,
      role: decoded.role,
      employeeId: decoded.employeeId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Admin authorization middleware.
 * Must be used after `authenticate`.
 */
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}
