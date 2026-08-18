/** AEGISHEALTH AI — Dashboard controller */

let riskNetwork = null;
let currentRegion = 'all';
let pollInterval = null;
let dataCache = {};

async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API error (${endpoint}):`, err);
    return { available: false, error: err.message };
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatModel(name) {
  return (name || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function showEmptyState(show) {
  document.getElementById('empty-state')?.classList.toggle('hidden', !show);
  document.getElementById('dashboard-content')?.classList.toggle('hidden', show);
}

function clearSkeletons() {
  document.querySelectorAll('.metric-value.skeleton').forEach(el => el.classList.remove('skeleton'));
}

async function loadDashboard() {
  const [health, summary, risk, forecast, anomalies, quality, models, pipeline, regions] = await Promise.all([
    fetchAPI('health'),
    fetchAPI('summary'),
    fetchAPI('risk'),
    fetchAPI('forecast'),
    fetchAPI('anomalies'),
    fetchAPI('data-quality'),
    fetchAPI('model-performance'),
    fetchAPI('pipeline-status'),
    fetchAPI('regions'),
  ]);

  dataCache = { summary, risk, forecast, anomalies, quality, models, pipeline, regions };

  document.getElementById('system-status').textContent = health.status || 'LOCAL SYSTEM ONLINE';

  if (!summary.available) {
    showEmptyState(true);
    return;
  }

  showEmptyState(false);
  clearSkeletons();

  // Header
  document.getElementById('data-mode').textContent = summary.data_mode || 'SYNTHETIC DEMONSTRATION';
  document.getElementById('last-run').textContent = formatDate(summary.pipeline_run_at);

  // Metric cards
  document.getElementById('metric-risk-level').textContent = summary.current_risk_level || '—';
  document.getElementById('metric-risk-level').className = `metric-value risk-${summary.current_risk_level}`;
  document.getElementById('metric-risk-score').textContent = summary.current_risk_score ?? '—';
  document.getElementById('metric-anomalies').textContent = summary.anomaly_count ?? '—';
  document.getElementById('metric-quality').textContent = `${summary.data_quality_score ?? '—'}%`;
  document.getElementById('metric-model').textContent = formatModel(summary.best_model);
  document.getElementById('metric-regions').textContent = summary.region_count ?? '—';

  // Gauge
  if (risk.available) {
    ChartBuilders.updateGauge(risk.risk_score, risk.risk_level);
  }

  // 3D Network
  if (regions.available && riskNetwork) {
    riskNetwork.updateRegions(regions.regions);
  }

  // Region filter
  const select = document.getElementById('region-filter');
  if (select && quality.available) {
    const current = select.value;
    select.innerHTML = '<option value="all">All Regions</option>';
    (quality.regions || []).forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      select.appendChild(opt);
    });
    select.value = currentRegion || current;
  }

  // Charts
  if (forecast.available) {
    ChartBuilders.buildActivityChart(forecast.historical, forecast.predictions, currentRegion);
    ChartBuilders.buildForecastChart(forecast.predictions, currentRegion);
  }

  // Anomalies
  if (anomalies.available) {
    document.getElementById('anom-total').textContent = anomalies.total_observations;
    document.getElementById('anom-detected').textContent = anomalies.anomalies_detected;
    document.getElementById('anom-latest').textContent = anomalies.latest_anomaly
      ? `${anomalies.latest_anomaly.region} — ${anomalies.latest_anomaly.date}`
      : 'None';
    document.getElementById('anom-highest').textContent = anomalies.highest_anomaly
      ? Number(anomalies.highest_anomaly.anomaly_score).toFixed(2)
      : '—';

    ChartBuilders.buildAnomalyChart(anomalies.records, currentRegion);

    const timeline = document.getElementById('anomaly-timeline');
    const flagged = (anomalies.records || []).filter(r => r.is_anomaly === true || r.is_anomaly === 'True');
    timeline.innerHTML = flagged.length
      ? flagged.slice(-20).reverse().map(r => `
          <div class="anomaly-item" data-date="${r.date}" data-region="${r.region}">
            <div><span class="region">${r.region}</span> <span class="date">${r.date}</span></div>
            <span class="score">${Number(r.anomaly_score).toFixed(2)}</span>
          </div>
        `).join('')
      : '<p style="color:var(--text-muted);font-size:12px;">No anomalies detected in current dataset.</p>';
  }

  // Risk decomposition
  if (risk.available) {
    const decomp = document.getElementById('risk-decomposition');
    const weights = risk.weights || {};
    decomp.innerHTML = Object.entries(risk.signals || {}).map(([key, signal]) => `
      <div class="risk-factor">
        <h4>${key.toUpperCase()}</h4>
        <div class="row"><span>Signal</span><span>${signal}</span></div>
        <div class="row"><span>Weight</span><span>${((weights[key] || 0) * 100).toFixed(0)}%</span></div>
        <div class="row"><span>Contribution</span><span>${risk.contributions?.[key] ?? '—'}</span></div>
      </div>
    `).join('');

    ChartBuilders.buildRiskContribChart(risk.contributions, risk.signals, weights);
  }

  // Data quality
  if (quality.available) {
    ChartBuilders.updateQualityRing(quality.data_quality_score);
    document.getElementById('data-status-label').textContent = quality.data_mode || 'SYNTHETIC DEMONSTRATION';

    const details = document.getElementById('quality-details');
    details.innerHTML = `
      <div><span>Records</span><span>${quality.records}</span></div>
      <div><span>Date Range</span><span>${quality.date_range?.start} → ${quality.date_range?.end}</span></div>
      <div><span>Regions</span><span>${(quality.regions || []).join(', ')}</span></div>
      <div><span>Missing Values</span><span>${Object.values(quality.missing_values || {}).reduce((a, b) => a + b, 0)}</span></div>
      <div><span>Duplicates</span><span>${quality.duplicate_rows}</span></div>
      <div><span>Invalid Dates</span><span>${quality.invalid_dates}</span></div>
      <div><span>Negative Cases</span><span>${quality.negative_case_counts}</span></div>
    `;

    const table = document.getElementById('data-table');
    table.innerHTML = `
      <table>
        <thead><tr><th>Field</th><th>Missing</th></tr></thead>
        <tbody>
          ${Object.entries(quality.missing_values || {}).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  // Models
  if (models.available) {
    const cards = document.getElementById('forecast-metrics');
    const metrics = models.metrics || {};
    const best = models.best_model;
    cards.innerHTML = ['naive', 'moving_average', 'ml_baseline'].map(name => {
      const m = metrics[name] || {};
      const isBest = name === best;
      return `
        <div class="model-card ${isBest ? 'best' : ''}">
          <h4>${formatModel(name)}${isBest ? '<span class="best-badge">BEST BASELINE</span>' : ''}</h4>
          <div class="metric-row"><span>MAE</span><span>${m.mae ?? '—'}</span></div>
          <div class="metric-row"><span>RMSE</span><span>${m.rmse ?? '—'}</span></div>
          <div class="metric-row"><span>R²</span><span>${m.r2 ?? '—'}</span></div>
        </div>
      `;
    }).join('');

    ChartBuilders.buildModelBenchmark(metrics, best);

    const modelTable = document.getElementById('model-table');
    modelTable.innerHTML = `
      <table>
        <thead><tr><th>Model</th><th>MAE</th><th>RMSE</th><th>R²</th><th>Status</th></tr></thead>
        <tbody>
          ${['naive', 'moving_average', 'ml_baseline'].map(name => {
            const m = metrics[name] || {};
            return `<tr>
              <td>${formatModel(name)}</td>
              <td>${m.mae ?? '—'}</td>
              <td>${m.rmse ?? '—'}</td>
              <td>${m.r2 ?? '—'}</td>
              <td>${name === best ? '<span style="color:var(--accent)">BEST BASELINE</span>' : '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // Pipeline
  if (pipeline.available) {
    const diagram = document.getElementById('pipeline-diagram');
    const stages = pipeline.stages || [];
    diagram.innerHTML = stages.map((s, i) => {
      const arrow = i < stages.length - 1 ? '<div class="pipeline-arrow">↓</div>' : '';
      return `
        <div class="pipeline-stage ${s.completed ? 'completed' : ''}">
          <span class="check">${s.completed ? '✓' : '○'}</span>
          <span class="name">${s.name}</span>
          ${s.completed ? '<span style="color:var(--accent-teal);font-size:10px;">COMPLETED</span>' : ''}
        </div>
        ${arrow}
      `;
    }).join('');
  }
}

async function selectRegion(region) {
  currentRegion = region;
  const select = document.getElementById('region-filter');
  if (select) select.value = region;

  const detail = await fetchAPI(`region/${region}`);
  if (detail.available && dataCache.forecast?.available) {
    ChartBuilders.buildActivityChart(detail.historical, detail.predictions, region);
    ChartBuilders.buildForecastChart(detail.predictions, region);
    ChartBuilders.buildAnomalyChart(detail.anomalies.length ? detail.anomalies : dataCache.anomalies?.records, region);

    if (detail.risk) {
      ChartBuilders.updateGauge(detail.risk.risk_score, detail.risk.risk_level);
      document.getElementById('metric-risk-level').textContent = detail.risk.risk_level;
      document.getElementById('metric-risk-level').className = `metric-value risk-${detail.risk.risk_level}`;
      document.getElementById('metric-risk-score').textContent = detail.risk.risk_score;
    }
  }
}

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`section-${btn.dataset.section}`)?.classList.add('active');
    });
  });
}

function initEvents() {
  document.getElementById('refresh-btn')?.addEventListener('click', () => loadDashboard());

  document.getElementById('region-filter')?.addEventListener('change', (e) => {
    if (e.target.value === 'all') {
      currentRegion = 'all';
      if (dataCache.forecast?.available) {
        ChartBuilders.buildActivityChart(dataCache.forecast.historical, dataCache.forecast.predictions, 'all');
        ChartBuilders.buildForecastChart(dataCache.forecast.predictions, 'all');
      }
      if (dataCache.risk?.available) {
        ChartBuilders.updateGauge(dataCache.risk.risk_score, dataCache.risk.risk_level);
      }
    } else {
      selectRegion(e.target.value);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initEvents();

  riskNetwork = new RiskNetwork('risk-network');
  riskNetwork.onRegionSelect = (region) => {
    currentRegion = region;
    selectRegion(region);
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-section="overview"]')?.classList.add('active');
    document.getElementById('section-overview')?.classList.add('active');
  };

  loadDashboard();
  pollInterval = setInterval(loadDashboard, 10000);
});
