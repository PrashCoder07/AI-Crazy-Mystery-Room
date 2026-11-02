# AI Mystery Room

A cyber-noir detective investigation app. Create a scenario, inspect the suspects and digital evidence, pin clues, then lock in an accusation to reveal the sealed solution.

## Run locally

Requirements: Node.js 20+ and npm.

```powershell
npm install
Copy-Item .env.example server/.env
npm run dev
```

The Vite client runs at `http://localhost:5173`; `/api` requests are proxied to Express on port `4000`. Check `http://localhost:5173/api/health` (or `http://localhost:4000/api/health`) to confirm the API is reachable. The response reports storage mode and whether Gemini is configured, without exposing credentials.

Without `GEMINI_API_KEY`, cases use a clearly labelled local simulation. Without `MONGO_URI`, accounts and cases live in memory and are lost when the server stops. Add these values to `server/.env` for Gemini generation and MongoDB persistence. Never commit `.env` files.

## Deploy to Render

The repository includes a `render.yaml` Blueprint. It deploys the Express API and the built React site from one Render web service, so the browser calls the API at the same origin instead of trying to reach `localhost`.

1. **Prepare a Git repository.** Push this project to a GitHub repository. Keep `.env` out of Git; `.gitignore` excludes it.
2. **Create a MongoDB Atlas cluster.** Create a database user with access to the app database, then copy the Atlas application connection string. Put the database name in the URI path, for example `/ai_mystery_room`, and URL-encode special characters in the database user's password.
3. **Create the Render service.** In Render, choose **New → Blueprint**, connect the GitHub repository, and let Render read `render.yaml`. It builds with `npm ci && npm run build`, starts with `npm start`, and checks `/api/health`.
4. **Add secrets.** During Blueprint creation, provide `MONGO_URI` and `GEMINI_API_KEY`. Render generates `JWT_SECRET`. The Gemini key is optional for a demo, but without it the app uses the labelled local simulation. Do not add secrets to `render.yaml` or the frontend.
5. **Allow the service to reach Atlas.** After Render creates the service, open its **Connect → Outbound** panel and copy its outbound IP ranges. Add those ranges to the Atlas project's **Network Access** IP access list. If the first Render health response shows `storage: "memory"`, restart/redeploy after adding the Atlas ranges; a successful connection reports `storage: "mongodb"`.
6. **Open the deployed URL.** Visit `https://<your-service>.onrender.com/api/health`; confirm `status` is `operational`, `storage` is `mongodb`, and `aiConfigured` is `true` when you supplied the Gemini key. Then register in the app and create a case.

The Blueprint uses Render's Free web service plan to keep the initial deploy no-cost. Free services can spin down after 15 minutes idle and take about a minute to wake up. For a production audience, choose an always-on paid plan in Render. The app stores persistent user/case data in Atlas rather than the web service's local filesystem.

If you deploy the frontend and API on different domains instead, set the frontend build variable `VITE_API_URL` to `https://<api-host>/api` and set the API's `CLIENT_ORIGIN` to the exact frontend origin.

## Project layout

- `client/` React 18 + Vite forensic terminal interface
- `server/` Express API, Gemini generation, validation, and optional MongoDB persistence
- `render.yaml` Render deployment Blueprint
- `spec.md` product and technical specification
