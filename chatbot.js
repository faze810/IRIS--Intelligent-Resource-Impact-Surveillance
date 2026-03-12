// IRIS - Chatbot JS
(function() {
  const fab = document.getElementById('chatbot-fab');
  const win = document.getElementById('chatbot-window');
  const close = document.getElementById('chatbot-close');
  const messages = document.getElementById('chatbot-messages');

  if (!fab) return;

  fab.addEventListener('click', () => win.classList.toggle('open'));
  close.addEventListener('click', () => win.classList.remove('open'));

  let chatStep = null;
  let chatState = {};
  let predChart = null;

  function addMsg(html, isBot = true) {
    const div = document.createElement('div');
    div.className = `msg msg-${isBot ? 'bot' : 'user'}`;
    div.innerHTML = `<div class="msg-bubble">${html}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addOptions(opts) {
    const div = document.createElement('div');
    div.className = 'msg msg-bot';
    const inner = document.createElement('div');
    inner.className = 'chatbot-options';
    opts.forEach(o => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-opt-btn';
      btn.textContent = o.label;
      btn.onclick = () => o.action();
      inner.appendChild(btn);
    });
    div.appendChild(inner);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function addStateSelect(label, cb) {
    const div = document.createElement('div');
    div.className = 'msg msg-bot';
    div.innerHTML = `<div class="msg-bubble">
      ${label}
      <select id="chat-state-sel" style="display:block;margin-top:10px;background:#f0f4ff;border:1px solid rgba(99,135,255,0.25);border-radius:8px;color:#111827;padding:7px 10px;font-size:12px;width:100%;cursor:pointer;">
        ${STATES.map(s => `<option value="${s}"${s==='Delhi'?' selected':''}>${s}</option>`).join('')}
      </select>
      <button onclick="window._chatStateCb(document.getElementById('chat-state-sel').value)" style="margin-top:8px;background:#4f8cff;border:none;color:#fff;padding:7px 14px;border-radius:7px;font-size:12px;cursor:pointer;font-family:'DM Sans',sans-serif;">Analyze →</button>
    </div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    window._chatStateCb = cb;
  }

  function addChartMsg(chartFn) {
    const div = document.createElement('div');
    div.className = 'msg msg-bot';
    const canvasId = 'chat-chart-' + Date.now();
    div.innerHTML = `<div class="msg-bubble" style="padding:12px"><canvas id="${canvasId}" height="150"></canvas></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    setTimeout(() => chartFn(canvasId), 100);
  }

  function startConversation() {
    messages.innerHTML = '';
    addMsg('👋 Hi! I\'m <b>IRIS AI</b>, your environmental intelligence assistant.<br><br>What would you like to analyze?');
    addOptions([
      { label: '🌫️ AQI Predictor (Next 3 Days)', action: () => startAQI() },
      { label: '💧 Water Quality Estimation (3 Weeks)', action: () => startWater() },
      { label: '🏭 Emission Forecast (3 Weeks)', action: () => startEmissions() },
    ]);
  }

  async function startAQI() {
    addMsg('🌫️ AQI Predictor', false);
    addStateSelect('Select a state for AQI prediction:', async (state) => {
      addMsg(`Analyzing <b>${state}</b>...`, false);
      addMsg(`⏳ Fetching AQI prediction for <b>${state}</b>...`);
      const data = await fetchData(`/api/predict/aqi?state=${encodeURIComponent(state)}&days=3`);
      if (!data || !data.length) { addMsg('❌ No data available.'); return; }

      const labels = data.map(d => d.date);
      const aqiVals = data.map(d => d.aqi);

      addMsg(`📊 <b>AQI Forecast for ${state}</b> — next 3 days:`);
      addChartMsg((cid) => {
        const ctx = document.getElementById(cid)?.getContext('2d');
        if (!ctx) return;
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              data: aqiVals,
              backgroundColor: aqiVals.map(v => getAQIStatus(v).color + 'cc'),
              borderColor: aqiVals.map(v => getAQIStatus(v).color),
              borderWidth: 1.5, borderRadius: 5
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(30,60,140,0.07)' } },
              y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(30,60,140,0.07)' } }
            }
          }
        });
      });

      data.forEach(d => {
        const s = getAQIStatus(d.aqi || 0);
        addMsg(`📅 <b>${d.date}</b> — AQI <span style="color:${s.color}">${Math.round(d.aqi || 0)} (${s.label})</span><br>PM2.5: ${formatNum(d.pm25)} | PM10: ${formatNum(d.pm10)}`);
      });

      addMsg('🗞️ <b>News Tip:</b> Current air quality advisories suggest reducing outdoor activities during peak pollution hours (8–11 AM, 6–9 PM) in high AQI regions.');

      addOptions([{ label: '← Back to menu', action: startConversation }]);
    });
  }

  async function startWater() {
    addMsg('💧 Water Quality Estimation', false);
    addStateSelect('Select a state for water quality prediction:', async (state) => {
      addMsg(`Analyzing <b>${state}</b>...`, false);
      addMsg(`⏳ Fetching water quality forecast for <b>${state}</b>...`);
      const data = await fetchData(`/api/predict/water?state=${encodeURIComponent(state)}&weeks=3`);
      if (!data || !data.length) { addMsg('❌ No data available.'); return; }

      addMsg(`📊 <b>Water Quality Forecast for ${state}</b> — next 3 weeks:`);
      addChartMsg((cid) => {
        const ctx = document.getElementById(cid)?.getContext('2d');
        if (!ctx) return;
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(d => d.week),
            datasets: [
              { label: 'TDS', data: data.map(d => d.tds), backgroundColor: 'rgba(79,140,255,0.7)', borderColor: '#4f8cff', borderWidth: 1.5, borderRadius: 4 },
              { label: 'pH×100', data: data.map(d => d.ph * 100), backgroundColor: 'rgba(0,212,170,0.7)', borderColor: '#00d4aa', borderWidth: 1.5, borderRadius: 4 },
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: '#6b7280', font: { size: 10 } } } },
            scales: {
              x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(30,60,140,0.07)' } },
              y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(30,60,140,0.07)' } }
            }
          }
        });
      });

      data.forEach(d => {
        const phOk = d.ph >= 6.5 && d.ph <= 8.5;
        addMsg(`📅 <b>${d.week}</b> (${d.date})<br>pH: ${formatNum(d.ph, 2)} ${phOk ? '✅' : '⚠️'} | TDS: ${formatNum(d.tds)} mg/L | Fluoride: ${formatNum(d.fluoride, 2)} | Arsenic: ${formatNum(d.arsenic, 4)}`);
      });

      addMsg('🗞️ <b>Water Advisory:</b> Groundwater levels in northern India show stress due to over-extraction. Consider rainwater harvesting initiatives.');
      addOptions([{ label: '← Back to menu', action: startConversation }]);
    });
  }

  async function startEmissions() {
    addMsg('🏭 Emission Forecast', false);
    addStateSelect('Select a state for emissions forecast:', async (state) => {
      addMsg(`Analyzing <b>${state}</b>...`, false);
      addMsg(`⏳ Fetching emissions data for <b>${state}</b>...`);
      const data = await fetchData(`/api/predict/emissions?state=${encodeURIComponent(state)}&weeks=3`);
      if (!data || !data.length) { addMsg('❌ No data available.'); return; }

      addMsg(`📊 <b>Emissions Forecast for ${state}</b> — next 3 weeks:`);
      addChartMsg((cid) => {
        const ctx = document.getElementById(cid)?.getContext('2d');
        if (!ctx) return;
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(d => d.week),
            datasets: [
              { label: 'CO₂', data: data.map(d => d.co2), backgroundColor: 'rgba(255,107,107,0.7)', borderColor: '#ff6b6b', borderWidth: 1.5, borderRadius: 4 },
              { label: 'CH₄', data: data.map(d => d.methane), backgroundColor: 'rgba(245,200,66,0.7)', borderColor: '#f5c842', borderWidth: 1.5, borderRadius: 4 },
              { label: 'N₂O', data: data.map(d => d.nitrous_oxide), backgroundColor: 'rgba(155,111,255,0.7)', borderColor: '#9b6fff', borderWidth: 1.5, borderRadius: 4 },
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: '#6b7280', font: { size: 10 } } } },
            scales: {
              x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(30,60,140,0.07)' } },
              y: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: 'rgba(30,60,140,0.07)' } }
            }
          }
        });
      });

      data.forEach(d => {
        addMsg(`📅 <b>${d.week}</b> — CO₂: ${formatNum(d.co2)} | CH₄: ${formatNum(d.methane, 2)} | N₂O: ${formatNum(d.nitrous_oxide, 2)} Mt`);
      });

      addMsg('🗞️ <b>Climate Note:</b> Industrial emissions are the largest contributor to India\'s GHG output. Renewable energy adoption targets 500 GW by 2030.');
      addOptions([{ label: '← Back to menu', action: startConversation }]);
    });
  }

  // Auto-start
  setTimeout(startConversation, 300);
})();
