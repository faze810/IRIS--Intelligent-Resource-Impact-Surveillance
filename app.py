import os
import sys
import threading
import time

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, render_template

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.after_request
def add_cors(r):
    r.headers['Access-Control-Allow-Origin'] = '*'
    return r

db_path = os.path.join(os.path.dirname(__file__), 'database.db')
if not os.path.exists(db_path):
    from database.init_db import init_db
    init_db()

from backend.api_routes import api
app.register_blueprint(api)

def run_scheduler():
    from backend.data_fetcher import fetch_and_store
    while True:
        time.sleep(1800)
        try:
            fetch_and_store()
        except Exception as e:
            print(f"Scheduler error: {e}")

threading.Thread(target=run_scheduler, daemon=True).start()

@app.route('/')
def index(): return render_template('index.html')

@app.route('/aqi')
def aqi_page(): return render_template('aqi.html')

@app.route('/water')
def water_page(): return render_template('water.html')

@app.route('/noise')
def noise_page(): return render_template('noise.html')

@app.route('/emissions')
def emissions_page(): return render_template('emissions.html')

if __name__ == '__main__':
    print("\n🌍 IRIS – Integrated Regional Intelligence System")
    print("Open http://127.0.0.1:5000\n")
    app.run(debug=False, port=5000)
