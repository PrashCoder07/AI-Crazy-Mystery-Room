import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { storageMode } from './config/db.js';
import authRouter from './routes/auth.js';
import mysteriesRouter from './routes/mysteries.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.clientOrigin.split(',').map((origin) => origin.trim()), credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(rateLimit({ windowMs: env.rateLimitWindowMs, limit: env.rateLimitMax, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ success: true, status: 'operational', storage: storageMode() }));
app.use('/api/auth', authRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/mysteries', mysteriesRouter);
app.use('/api/v1/investigations', mysteriesRouter);

app.use((_req, res) => res.status(404).json({ success: false, error: 'Endpoint not found.' }));
app.use((error, _req, res, _next) => {
  if (error?.name === 'ZodError') return res.status(400).json({ success: false, error: error.issues[0]?.message || 'Request validation failed.' });
  console.error('[api]', error);
  return res.status(500).json({ success: false, error: 'The server could not complete that request.' });
});

export default app;
