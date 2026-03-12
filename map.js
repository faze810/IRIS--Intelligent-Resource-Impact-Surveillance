// IRIS - Map JS (Light Theme)
let indiaMap, stateMap;

const STATE_COORDS = {
  "Delhi": [28.7041, 77.1025], "Maharashtra": [19.7515, 75.7139],
  "Karnataka": [15.3173, 75.7139], "Tamil Nadu": [11.1271, 78.6569],
  "Gujarat": [22.2587, 71.1924], "Rajasthan": [27.0238, 74.2179],
  "Uttar Pradesh": [26.8467, 80.9462], "Madhya Pradesh": [22.9734, 78.6569],
  "West Bengal": [22.9868, 87.8550], "Bihar": [25.0961, 85.3131],
  "Andhra Pradesh": [15.9129, 79.7400], "Telangana": [17.1232, 79.2089],
  "Odisha": [20.9517, 85.0985], "Kerala": [10.8505, 76.2711],
  "Punjab": [31.1471, 75.3412], "Haryana": [29.0588, 76.0856],
  "Jharkhand": [23.6102, 85.2799], "Assam": [26.2006, 92.9376],
  "Chhattisgarh": [21.2787, 81.8661], "Uttarakhand": [30.0668, 79.0193],
  "Himachal Pradesh": [31.1048, 77.1734], "Goa": [15.2993, 74.1240],
  "Tripura": [23.9408, 91.9882], "Meghalaya": [25.4670, 91.3662],
  "Manipur": [24.6637, 93.9063], "Nagaland": [26.1584, 94.5624],
  "Arunachal Pradesh": [28.2180, 94.7278], "Mizoram": [23.1645, 92.9376],
  "Sikkim": [27.5330, 88.5122], "Jammu and Kashmir": [33.7782, 76.5762],
  "Ladakh": [34.2268, 77.5619], "Puducherry": [11.9416, 79.8083],
  "Chandigarh": [30.7333, 76.7794]
};

const AQI_COLORS = {
  good:      '#059669',
  moderate:  '#d97706',
  poor:      '#ea580c',
  'very-poor': '#dc2626',
  severe:    '#991b1b'
};

function initIndiaMap(containerId, data) {
  if (indiaMap) { indiaMap.remove(); indiaMap = null; }

  indiaMap = L.map(containerId, {
    center: [22.5, 82.5], zoom: 4, minZoom: 3, maxZoom: 10,
    zoomControl: true, attributionControl: false
  });

  // Light map tile
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(indiaMap);

  if (data) {
    data.forEach(row => {
      const coords = STATE_COORDS[row.state];
      if (!coords) return;
      const status = getAQIStatus(row.aqi || 0);
      L.circleMarker(coords, {
        radius: 10, fillColor: status.color,
        color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.85
      }).addTo(indiaMap).bindPopup(`
        <div style="font-family:'DM Sans',sans-serif;padding:4px;min-width:160px">
          <div style="font-weight:700;margin-bottom:6px;font-size:14px;color:#111">${row.state}</div>
          <div style="color:${status.color};font-weight:700;font-size:16px">AQI ${row.aqi || '–'} <span style="font-size:12px;font-weight:500">${status.label}</span></div>
          <div style="margin-top:8px;font-size:12px;color:#6b7280">
            PM2.5: ${formatNum(row.pm25)} | PM10: ${formatNum(row.pm10)}<br>
            NO₂: ${formatNum(row.no2)} | SO₂: ${formatNum(row.so2)}
          </div>
        </div>
      `, { className: 'iris-popup' });
    });
  }
}

function initStateMap(containerId, state) {
  if (stateMap) { stateMap.remove(); stateMap = null; }
  const coords = STATE_COORDS[state] || [22.5, 82.5];

  stateMap = L.map(containerId, {
    center: coords, zoom: 7, zoomControl: true, attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(stateMap);

  L.circleMarker(coords, {
    radius: 14, fillColor: '#1a56db',
    color: '#fff', weight: 2.5, fillOpacity: 0.8
  }).addTo(stateMap).bindPopup(`<b style="color:#111">${state}</b>`).openPopup();
}

async function loadHomeMap() {
  const el = document.getElementById('india-map');
  if (!el) return;
  const data = await fetchData('/api/aqi');
  initIndiaMap('india-map', data);
}

document.addEventListener('DOMContentLoaded', loadHomeMap);
