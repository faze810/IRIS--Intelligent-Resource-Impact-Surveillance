import sqlite3
import os
import random
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database.db')

STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
]

STATE_AQI_PROFILE = {
    "Delhi": {"pm25": (150, 300), "pm10": (200, 400), "so2": (20, 60), "co": (3, 8), "no2": (60, 120)},
    "Uttar Pradesh": {"pm25": (100, 250), "pm10": (150, 350), "so2": (15, 50), "co": (2, 7), "no2": (50, 100)},
    "Bihar": {"pm25": (90, 200), "pm10": (130, 300), "so2": (12, 45), "co": (2, 6), "no2": (40, 90)},
    "Maharashtra": {"pm25": (50, 150), "pm10": (80, 200), "so2": (10, 35), "co": (1, 4), "no2": (30, 70)},
    "Karnataka": {"pm25": (30, 100), "pm10": (50, 150), "so2": (8, 25), "co": (1, 3), "no2": (20, 60)},
    "Kerala": {"pm25": (20, 60), "pm10": (30, 90), "so2": (5, 20), "co": (0.5, 2), "no2": (15, 45)},
    "default": {"pm25": (40, 150), "pm10": (60, 200), "so2": (10, 40), "co": (1, 5), "no2": (25, 80)},
}

def get_profile(state, metric):
    profile = STATE_AQI_PROFILE.get(state, STATE_AQI_PROFILE["default"])
    return profile.get(metric, (10, 100))

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS aqi_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state TEXT NOT NULL,
        pm25 REAL, pm10 REAL, so2 REAL, co REAL, no2 REAL,
        aqi INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS water_quality (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state TEXT NOT NULL,
        ph REAL, tds REAL, fluoride REAL, arsenic REAL, iron REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS noise_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state TEXT NOT NULL,
        decibel_level REAL,
        zone_type TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS emissions_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        state TEXT NOT NULL,
        co2 REAL, methane REAL, nitrous_oxide REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Seed initial data
    now = datetime.now()
    for state in STATES:
        for i in range(7):
            ts = now - timedelta(days=i)

            pm25_r = get_profile(state, "pm25")
            pm10_r = get_profile(state, "pm10")
            so2_r = get_profile(state, "so2")
            co_r = get_profile(state, "co")
            no2_r = get_profile(state, "no2")

            pm25 = round(random.uniform(*pm25_r), 1)
            pm10 = round(random.uniform(*pm10_r), 1)
            so2 = round(random.uniform(*so2_r), 1)
            co = round(random.uniform(*co_r), 2)
            no2 = round(random.uniform(*no2_r), 1)
            aqi = int(pm25 * 1.5 + no2 * 0.5)

            c.execute("INSERT INTO aqi_data (state,pm25,pm10,so2,co,no2,aqi,timestamp) VALUES (?,?,?,?,?,?,?,?)",
                      (state, pm25, pm10, so2, co, no2, aqi, ts))

            c.execute("INSERT INTO water_quality (state,ph,tds,fluoride,arsenic,iron,timestamp) VALUES (?,?,?,?,?,?,?)",
                      (state, round(random.uniform(6.5, 8.5), 2), round(random.uniform(200, 1200), 1),
                       round(random.uniform(0.2, 2.5), 2), round(random.uniform(0.001, 0.08), 4),
                       round(random.uniform(0.1, 3.0), 2), ts))

            for zone in ["Residential", "Commercial", "Industrial"]:
                base = {"Residential": (40, 65), "Commercial": (55, 75), "Industrial": (65, 90)}[zone]
                c.execute("INSERT INTO noise_data (state,decibel_level,zone_type,timestamp) VALUES (?,?,?,?)",
                          (state, round(random.uniform(*base), 1), zone, ts))

            c.execute("INSERT INTO emissions_data (state,co2,methane,nitrous_oxide,timestamp) VALUES (?,?,?,?,?)",
                      (state, round(random.uniform(10, 500), 1), round(random.uniform(1, 50), 2),
                       round(random.uniform(0.5, 25), 2), ts))

    conn.commit()
    conn.close()
    print("Database initialized with seed data.")

if __name__ == "__main__":
    init_db()
