# Solar Feasibility Pro - Local Setup Guide (Windows)

This is the standalone version of the Solar Feasibility Pro application.  
It runs completely on your machine — no Internet Computer, no Linux required.

---

## Prerequisites

- **Python 3.8+** — Download from https://www.python.org/downloads/  
  ✅ During install, check **"Add Python to PATH"**
- **Node.js 18+** — Download from https://nodejs.org/  
  ✅ Use the LTS version

Verify installations:
```bash
python --version
node --version
npm --version
```

---

## Setup Instructions

### Step 1: Start the Backend (Flask)

Open **Terminal 1** (Command Prompt or PowerShell):

```bash
cd local-project\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

You should see:
```
==================================================
  Solar Feasibility Pro - Backend Server
  Running at: http://localhost:5000
  Health check: http://localhost:5000/api/health
==================================================
```

Leave this terminal open while using the app.

---

### Step 2: Start the Frontend (React)

Open **Terminal 2** (a new Command Prompt or PowerShell window):

```bash
cd local-project\frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

Then open your browser at: **http://localhost:5173**

---

## How It Works

| Component | Port | Description |
|-----------|------|-------------|
| Flask backend | 5000 | Stores prediction history in `history.json` |
| React frontend | 5173 | The app UI you see in the browser |

- **Prediction history** is saved to `backend/history.json` on your machine
- **Weather data** is fetched live from Open-Meteo (free, no API key)
- **Location search** uses OpenStreetMap Nominatim geocoding
- **ML model** runs entirely in the browser (no Python ML libraries needed)

---

## Troubleshooting

### "python is not recognized"
Re-install Python and make sure you check "Add Python to PATH" during setup.

### "pip is not recognized"
Run: `python -m pip install -r requirements.txt`

### "npm is not recognized"
Re-install Node.js from https://nodejs.org

### Backend shows CORS errors
Make sure the Flask server is running (Terminal 1) before starting the frontend.

### Port 5000 already in use
Change the port in `backend/app.py` (last line: `port=5000`) to `5001` and update the API base URL in `frontend/src/pages/PredictionPage.tsx` and `frontend/src/pages/DashboardPage.tsx`.

### History not saving
Check that `backend/history.json` exists after the first prediction. If it doesn't, verify the Flask server is running.

---

## Project Structure

```
local-project/
├── backend/
│   ├── app.py              # Flask REST API
│   ├── requirements.txt    # Python dependencies
│   └── history.json        # Auto-created when first prediction is saved
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx         # Landing page + subsidies
│   │   │   ├── PredictionPage.tsx   # Map + ML prediction
│   │   │   └── DashboardPage.tsx    # Analytics + history
│   │   ├── data/solarDataset.ts     # Real 52-row dataset
│   │   └── utils/prediction.ts     # Linear regression model
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Check if backend is running |
| GET | /api/history | Get all prediction records |
| POST | /api/history | Save a new prediction |
| DELETE | /api/history/:id | Delete a prediction |

---

*Solar Installation Feasibility & Power Prediction System — Built with React + Flask + Open-Meteo*
