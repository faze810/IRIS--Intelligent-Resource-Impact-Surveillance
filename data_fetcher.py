import sqlite3
import random
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database.db')

STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
]

STATE_PROFILE = {
    "Delhi": {"aqi_mult": 2.5}, "Uttar Pradesh": {"aqi_mult": 2.0},
    "Bihar": {"aqi_mult": 1.8}, "Punjab": {"aqi_mult": 1.6},
    "Haryana": {"aqi_mult": 1.7}, "Maharashtra": {"aqi_mult": 1.2},
    "Karnataka": {"aqi_mult": 0.9}, "Kerala": {"aqi_mult": 0.7},
    "default": {"aqi_mult": 1.0}
}

def fetch_and_store():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    ts = datetime.now()

    for state in STATES:
        mult = STATE_PROFILE.get(state, STATE_PROFILE["default"])["aqi_mult"]

        pm25 = round(random.uniform(20, 120) * mult, 1)
        pm10 = round(random.uniform(40, 200) * mult, 1)
        so2 = round(random.uniform(5, 30) * mult, 1)
        co = round(random.uniform(0.5, 4) * mult, 2)
        no2 = round(random.uniform(15, 60) * mult, 1)
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
                  (state, round(random.uniform(10, 500) * mult, 1),
                   round(random.uniform(1, 50) * mult, 2),
                   round(random.uniform(0.5, 25) * mult, 2), ts))

    conn.commit()
    conn.close()
    print(f"[{ts}] Data refreshed for {len(STATES)} states.")
