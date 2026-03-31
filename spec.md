# Solar Feasibility Pro

## Current State
A full-stack solar prediction app deployed on Caffeine (Internet Computer / Motoko backend). It has:
- **HomePage**: Hero, feature cards, CTA section, footer
- **PredictionPage**: Leaflet map (clickable), city search (button), lat/lon inputs, auto-detect, Open-Meteo weather integration, ML prediction, daily/weekly/monthly/yearly analysis tabs
- **DashboardPage**: Analytics, insights, history, ML info, dataset tabs — history stored in IC canister
- All prediction/history logic goes through `useActor` → Motoko canister

When downloaded and run locally on Windows, the app crashes because `CANISTER_ID_BACKEND is not set` — there's no Internet Computer running locally.

## Requested Changes (Diff)

### Add
- `local-project/` directory: complete standalone Python Flask + React project that runs on Windows without any Internet Computer dependency
  - `backend/app.py`: Flask REST API (GET/POST/DELETE history, health check), stores data in `history.json`
  - `backend/requirements.txt`: Only `flask` and `flask-cors` (Windows-native)
  - `frontend/`: React + Vite + Tailwind app — identical design, no `@dfinity/*` dependencies, calls Flask API for history
  - `README.md`: Windows step-by-step setup instructions
- **Prediction page**: Autocomplete dropdown — as user types a city name, show live suggestions from Nominatim API (debounced 400ms), clicking a suggestion moves the map marker and fills the lat/lon fields
- **Homepage**: New "Government of India Solar Subsidies" section showing PM Surya Ghar Muft Bijli Yojana, central financial assistance rates (table), state-wise subsidies, and how to apply

### Modify
- `local-project/frontend/src/pages/PredictionPage.tsx`: Remove `FeasibilityStatus` import and `useActor` calls; replace with `fetch('http://localhost:5000/api/history', ...)` POST when prediction is saved
- `local-project/frontend/src/pages/DashboardPage.tsx`: Remove `Record_` import and `useActor`; replace history calls with Flask API; fix timestamp (Flask uses ms int, not IC nanoseconds BigInt)
- `src/frontend/src/pages/PredictionPage.tsx` (Caffeine): Add autocomplete suggestions dropdown
- `src/frontend/src/pages/HomePage.tsx` (Caffeine): Add subsidies section

### Remove
- All `@dfinity/*` imports from local-project frontend
- `useActor` hook usage from local-project pages
- IC canister config from local-project (no `env.json`, no `config.ts`, no IC-specific vite env plugin)

## Implementation Plan
1. Write `spec.md` (this file)
2. Create `local-project/backend/app.py` — Flask with CORS, JSON file storage
3. Create `local-project/backend/requirements.txt`
4. Create `local-project/README.md` with Windows setup guide
5. Create all `local-project/frontend/` config files (package.json, vite.config.ts, tailwind.config.js, tsconfig.json, postcss.config.js, index.html)
6. Create `local-project/frontend/src/` files: main.tsx, App.tsx, index.css, lib/utils.ts, components/Navbar.tsx, data/solarDataset.ts, utils/prediction.ts
7. Create `local-project/frontend/src/pages/HomePage.tsx` — same as Caffeine version + subsidies section
8. Create `local-project/frontend/src/pages/PredictionPage.tsx` — same logic + autocomplete + Flask API save
9. Create `local-project/frontend/src/pages/DashboardPage.tsx` — same UI + Flask API history
10. Update `src/frontend/src/pages/PredictionPage.tsx` (Caffeine) — add autocomplete dropdown
11. Update `src/frontend/src/pages/HomePage.tsx` (Caffeine) — add subsidies section
12. Validate and deploy Caffeine app
