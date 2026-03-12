# IRIS – Integrated Regional Intelligence System

A national environmental intelligence dashboard for India providing real-time AQI monitoring, water quality analysis, noise pollution tracking, and industrial emissions data with AI-powered forecasts.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Features
- 🌫️ **AQI Monitor** – PM2.5, PM10, SO₂, CO, NO₂ with 3-day AI predictions
- 💧 **Water Quality** – pH, TDS, fluoride, arsenic, iron with 3-week forecasts
- 🔊 **Noise Pollution** – Residential, commercial, industrial zone dB monitoring
- 🏭 **Emissions Tracker** – CO₂, methane, nitrous oxide with trend analysis
- 🤖 **AI Chatbot** – Conversational forecasts and environmental news
- 🗺️ **Interactive Map** – Leaflet.js India map with AQI color overlays
- ⏰ **Auto-refresh** – Data updates every 30 minutes via APScheduler

## Tech Stack
- **Backend**: Python Flask + SQLite
- **Frontend**: HTML5, CSS3, Vanilla JS
- **Maps**: Leaflet.js
- **Charts**: Chart.js
- **AI**: NumPy/Pandas linear regression
- **Scheduler**: APScheduler

## Project Structure
```
iris-platform/
├── app.py              # Flask entry point
├── requirements.txt
├── database.db         # SQLite (auto-created)
├── backend/
│   ├── api_routes.py   # REST API endpoints
│   ├── data_fetcher.py # Data generation/update
│   └── scheduler.py    # 30-min refresh scheduler
├── database/
│   └── init_db.py      # Schema + seed data
├── ai/
│   ├── aqi_predictor.py
│   ├── water_predictor.py
│   └── emission_predictor.py
├── static/
│   ├── css/style.css
│   └── js/{main,map,charts,chatbot}.js
└── templates/
    ├── index.html
    ├── aqi.html
    ├── water.html
    ├── noise.html
    └── emissions.html
```

## API Endpoints
| Endpoint | Description |
|---|---|
| `GET /api/aqi?state=Delhi` | AQI data |
| `GET /api/water?state=Delhi` | Water quality |
| `GET /api/noise?state=Delhi` | Noise levels |
| `GET /api/emissions?state=Delhi` | Emissions data |
| `GET /api/predict/aqi?state=Delhi&days=3` | AQI forecast |
| `GET /api/predict/water?state=Delhi&weeks=3` | Water forecast |
| `GET /api/predict/emissions?state=Delhi&weeks=3` | Emissions forecast |
| `GET /api/summary` | National averages |
