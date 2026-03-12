from flask import Blueprint, jsonify, request
import sqlite3
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from ai.aqi_predictor import predict_aqi
from ai.water_predictor import predict_water
from ai.emission_predictor import predict_emissions

api = Blueprint('api', __name__)
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database.db')

def query_db(sql, args=()):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(sql, args)
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return rows

@api.route('/api/aqi')
def get_aqi():
    state = request.args.get('state')
    if state:
        rows = query_db("SELECT * FROM aqi_data WHERE state=? ORDER BY timestamp DESC LIMIT 7", (state,))
    else:
        rows = query_db("SELECT * FROM aqi_data WHERE id IN (SELECT MAX(id) FROM aqi_data GROUP BY state) ORDER BY state")
    return jsonify(rows)

@api.route('/api/water')
def get_water():
    state = request.args.get('state')
    if state:
        rows = query_db("SELECT * FROM water_quality WHERE state=? ORDER BY timestamp DESC LIMIT 7", (state,))
    else:
        rows = query_db("SELECT * FROM water_quality WHERE id IN (SELECT MAX(id) FROM water_quality GROUP BY state) ORDER BY state")
    return jsonify(rows)

@api.route('/api/noise')
def get_noise():
    state = request.args.get('state')
    if state:
        rows = query_db("SELECT * FROM noise_data WHERE state=? ORDER BY timestamp DESC LIMIT 21", (state,))
    else:
        rows = query_db("SELECT * FROM noise_data WHERE id IN (SELECT MAX(id) FROM noise_data GROUP BY state, zone_type) ORDER BY state")
    return jsonify(rows)

@api.route('/api/emissions')
def get_emissions():
    state = request.args.get('state')
    if state:
        rows = query_db("SELECT * FROM emissions_data WHERE state=? ORDER BY timestamp DESC LIMIT 7", (state,))
    else:
        rows = query_db("SELECT * FROM emissions_data WHERE id IN (SELECT MAX(id) FROM emissions_data GROUP BY state) ORDER BY state")
    return jsonify(rows)

@api.route('/api/predict/aqi')
def pred_aqi():
    state = request.args.get('state', 'Delhi')
    days = int(request.args.get('days', 3))
    return jsonify(predict_aqi(state, days))

@api.route('/api/predict/water')
def pred_water():
    state = request.args.get('state', 'Delhi')
    weeks = int(request.args.get('weeks', 3))
    return jsonify(predict_water(state, weeks))

@api.route('/api/predict/emissions')
def pred_emissions():
    state = request.args.get('state', 'Delhi')
    weeks = int(request.args.get('weeks', 3))
    return jsonify(predict_emissions(state, weeks))

@api.route('/api/states')
def get_states():
    rows = query_db("SELECT DISTINCT state FROM aqi_data ORDER BY state")
    return jsonify([r['state'] for r in rows])

@api.route('/api/summary')
def get_summary():
    aqi = query_db("SELECT AVG(aqi) as avg_aqi, MAX(aqi) as max_aqi, MIN(aqi) as min_aqi FROM aqi_data WHERE timestamp > datetime('now', '-1 day')")
    water = query_db("SELECT AVG(ph) as avg_ph, AVG(tds) as avg_tds FROM water_quality WHERE timestamp > datetime('now', '-1 day')")
    noise = query_db("SELECT AVG(decibel_level) as avg_db FROM noise_data WHERE timestamp > datetime('now', '-1 day')")
    emissions = query_db("SELECT AVG(co2) as avg_co2 FROM emissions_data WHERE timestamp > datetime('now', '-1 day')")
    return jsonify({
        "aqi": aqi[0] if aqi else {},
        "water": water[0] if water else {},
        "noise": noise[0] if noise else {},
        "emissions": emissions[0] if emissions else {}
    })
