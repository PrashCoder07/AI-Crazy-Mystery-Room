import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, error: 'Sign in to open the investigation room.' });

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, username: payload.username, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Your session has expired. Sign in again.' });
  }
}

export function createToken(user) {
  return jwt.sign({ username: user.username, email: user.email }, env.jwtSecret, { subject: user.id, expiresIn: '7d' });
}
