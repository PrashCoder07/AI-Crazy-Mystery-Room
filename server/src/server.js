import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

if (process.env.NODE_ENV === 'production' && env.jwtSecret === 'local-development-secret-change-me') {
  throw new Error('Set JWT_SECRET before starting in production.');
}

await connectDatabase();
app.listen(env.port, () => {
  console.info(`[server] AI Mystery Room API listening on http://localhost:${env.port}`);
  if (!env.geminiApiKey) console.info('[server] Gemini key absent; case generation uses the labelled local simulation.');
});
