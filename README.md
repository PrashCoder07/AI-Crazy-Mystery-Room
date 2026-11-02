# AI Mystery Room

A cyber-noir detective investigation app. Create a scenario, examine the suspects and digital evidence, pin clues, then lock in an accusation to reveal the sealed solution.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
Copy-Item .env.example server/.env
npm run dev
```

The app runs at `http://localhost:5173` and the API at `http://localhost:4000`. With no Gemini key or MongoDB URI, it uses clearly labelled local cases and in-memory storage. Add `GEMINI_API_KEY` to `.env` or `server/.env` to use Gemini, and `MONGO_URI` to persist cases in MongoDB.

## Environment

See `.env.example`. Gemini is called only by the server. A generated mystery's solution is omitted from public case responses and returned only after accusation.

## Project layout

- `client/` React 18 + Vite forensic terminal interface
- `server/` Express API, Gemini generation, validation, and optional MongoDB persistence
- `spec.md` product and technical specification

The local fallback is an explicitly marked simulation, not an AI-generated case. This lets the complete investigation loop be explored before connecting external services.
