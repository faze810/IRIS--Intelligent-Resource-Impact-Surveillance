// IRIS - Main JS
const API = '';

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh"
];

function getAQIStatus(aqi) {
  if (aqi <= 50) return { label: 'Good', cls: 'good', color: '#00c986' };
  if (aqi <= 100) return { label: 'Moderate', cls: 'moderate', color: '#f5c842' };
  if (aqi <= 200) return { label: 'Poor', cls: 'poor', color: '#ff8c42' };
  if (aqi <= 300) return { label: 'Very Poor', cls: 'very-poor', color: '#ff4242' };
  return { label: 'Severe', cls: 'severe', color: '#c20000' };
}

function populateStateSelect(selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  STATES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    if (s === 'Delhi') opt.selected = true;
    sel.appendChild(opt);
  });
}

async function fetchData(url) {
  try {
    const r = await fetch(url);
    return await r.json();
  } catch(e) {
    console.error('Fetch error:', e);
    return null;
  }
}

function formatNum(n, dec = 1) {
  if (n == null) return '–';
  return Number(n).toFixed(dec);
}

// Update ticker
function initTicker() {
  const ticker = document.querySelector('.update-ticker .ticker-time');
  if (ticker) {
    const update = () => { ticker.textContent = new Date().toLocaleTimeString(); };
    update();
    setInterval(update, 1000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTicker();
  // Mark active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
    if (path === '/' && a.getAttribute('href') === '/') a.classList.add('active');
  });
});
