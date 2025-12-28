
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js'

export default async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });

    // Verify the token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 Debug temporarily
    console.log('JWT payload:', payload);

    // Support multiple possible claim names
    const userId = payload.userId || payload.id || payload._id || payload.sub;
    if (!userId) return res.status(401).json({ error: 'Invalid token payload' });

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: 'Invalid user id in token' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Invalid User' });

    req.user = user; // attach to request for controllers
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
