import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import { storageMode } from '../config/db.js';
import { createToken, requireAuth } from '../middleware/auth.js';

const router = Router();
const memoryUsers = new Map();
const registerSchema = z.object({ username: z.string().trim().min(2).max(32), email: z.string().trim().email().max(160), password: z.string().min(8).max(128) });
const loginSchema = z.object({ email: z.string().trim().email().max(160), password: z.string().min(1).max(128) });

router.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const existing = storageMode() === 'mongodb' ? await User.findOne({ email }) : [...memoryUsers.values()].find((user) => user.email === email);
    if (existing) return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    const user = { id: randomUUID(), username: input.username, email, passwordHash: await bcrypt.hash(input.password, 12), createdAt: new Date() };
    if (storageMode() === 'mongodb') await User.create({ ...user, _id: user.id });
    else memoryUsers.set(user.id, user);
    return res.status(201).json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const email = input.email.toLowerCase();
    let user;
    if (storageMode() === 'mongodb') {
      const document = await User.findOne({ email }).select('+passwordHash');
      user = document ? { id: document._id.toString(), username: document.username, email: document.email, passwordHash: document.passwordHash } : null;
    } else user = [...memoryUsers.values()].find((candidate) => candidate.email === email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ success: false, error: 'Email or password did not match.' });
    return res.json({ success: true, token: createToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ success: true, user: req.user }));

function publicUser(user) { return { id: user.id, username: user.username, email: user.email }; }

export default router;
