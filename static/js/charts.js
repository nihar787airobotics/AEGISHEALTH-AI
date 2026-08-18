/** AEGISHEALTH AI — Plotly chart builders */

const CHART_LAYOUT = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { family: 'Inter, sans-serif', color: '#7a8ba8', size: 11 },
  margin: { t: 24, r: 24, b: 48, l: 56 },
  xaxis: {
    gridcolor: 'rgba(0,212,255,0.06)',
    zerolinecolor: 'rgba(0,212,255,0.1)',
    tickfont: { size: 10 },
  },
  yaxis: {
    gridcolor: 'rgba(0,212,255,0.06)',
    zerolinecolor: 'rgba(0,212,255,0.1)',
    tickfont: { size: 10 },
  },
  legend: {
    orientation: 'h',
    y: 1.12,
    x: 0,
    font: { size: 10, color: '#7a8ba8' },
  },
  hovermode: 'x unified',
};

const COLORS = {
  actual: '#00d4ff',
  rolling: '#3b82f6',
  forecast: '#00e5c0',
  anomaly: '#f97316',
  naive: '#7a8ba8',
  moving_average: '#3b82f6',
  ml_baseline: '#00d4ff',
};

function riskColor(level) {
  return { LOW: '#22c55e', MODERATE: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' }[level] || '#00d4ff';
}

function buildActivityChart(historical, predictions, region = 'all') {
  let hist = historical || [];
  let pred = predictions || [];

  if (region !== 'all') {
    hist = hist.filter(r => r.region === region);
    pred = pred.filter(r => r.region === region);
  } else {
    // Aggregate by date across regions
    const byDate = {};
    hist.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = { cases: 0, rolling: 0, count: 0 };
      byDate[r.date].cases += Number(r.disease_cases) || 0;
      byDate[r.date].rolling += Number(r.rolling_mean_7) || 0;
      byDate[r.date].count++;
    });
    hist = Object.entries(byDate).map(([date, v]) => ({
      date,
      disease_cases: v.cases,
      rolling_mean_7: v.rolling / v.count,
      is_anomaly: false,
      anomaly_score: 0,
      expected_cases: v.cases,
    })).sort((a, b) => a.date.localeCompare(b.date));

    const predByDate = {};
    pred.forEach(r => {
      if (!predByDate[r.date]) predByDate[r.date] = 0;
      predByDate[r.date] += Number(r.predicted_cases) || 0;
    });
    pred = Object.entries(predByDate).map(([date, v]) => ({
      date,
      predicted_cases: v,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  const traces = [
    {
      x: hist.map(r => r.date),
      y: hist.map(r => r.disease_cases),
      name: 'Observed Cases',
      type: 'scatter',
      mode: 'lines',
      line: { color: COLORS.actual, width: 2 },
    },
    {
      x: hist.map(r => r.date),
      y: hist.map(r => r.rolling_mean_7),
      name: '7-Day Rolling Avg',
      type: 'scatter',
      mode: 'lines',
      line: { color: COLORS.rolling, width: 1.5, dash: 'dot' },
    },
  ];

  const anomalies = hist.filter(r => r.is_anomaly === true || r.is_anomaly === 'True' || r.is_anomaly === 1);
  if (anomalies.length) {
    traces.push({
      x: anomalies.map(r => r.date),
      y: anomalies.map(r => r.disease_cases),
      name: 'Anomaly',
      type: 'scatter',
      mode: 'markers',
      marker: { color: COLORS.anomaly, size: 10, symbol: 'diamond' },
      customdata: anomalies.map(r => [r.region, r.expected_cases, r.anomaly_score]),
      hovertemplate: 'Date: %{x}<br>Cases: %{y}<br>Expected: %{customdata[1]}<br>Score: %{customdata[2]:.2f}<extra></extra>',
    });
  }

  if (pred.length) {
    traces.push({
      x: pred.map(r => r.date),
      y: pred.map(r => r.predicted_cases),
      name: 'Forecast (MODEL PREDICTION)',
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: COLORS.forecast, width: 2, dash: 'dash' },
      marker: { size: 4 },
    });
  }

  const layout = {
    ...CHART_LAYOUT,
    title: { text: region === 'all' ? 'All Regions — Disease Activity' : `${region} — Disease Activity`, font: { size: 12, color: '#e8f0ff' } },
    yaxis: { ...CHART_LAYOUT.yaxis, title: 'Cases' },
  };

  Plotly.newPlot('activity-chart', traces, layout, { responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['lasso2d', 'select2d'] });
}

function buildForecastChart(predictions, region = 'all') {
  let pred = predictions || [];
  if (region !== 'all') pred = pred.filter(r => r.region === region);
  else {
    const byDate = {};
    pred.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = { sum: 0, count: 0 };
      byDate[r.date].sum += Number(r.predicted_cases) || 0;
      byDate[r.date].count++;
    });
    pred = Object.entries(byDate).map(([date, v]) => ({ date, predicted_cases: v.sum }));
  }

  Plotly.newPlot('forecast-chart', [{
    x: pred.map(r => r.date),
    y: pred.map(r => r.predicted_cases),
    name: 'MODEL PREDICTION',
    type: 'scatter',
    mode: 'lines+markers',
    fill: 'tozeroy',
    fillcolor: 'rgba(0,229,192,0.08)',
    line: { color: COLORS.forecast, width: 2, dash: 'dash' },
    marker: { size: 6, color: COLORS.forecast },
  }], {
    ...CHART_LAYOUT,
    title: { text: '14-Day Forecast — MODEL PREDICTION (not actual cases)', font: { size: 12, color: '#eab308' } },
    yaxis: { ...CHART_LAYOUT.yaxis, title: 'Predicted Cases' },
  }, { responsive: true, displayModeBar: false });
}

function buildAnomalyChart(records, region = 'all') {
  let data = records || [];
  if (region !== 'all') data = data.filter(r => r.region === region);

  Plotly.newPlot('anomaly-chart', [
    {
      x: data.map(r => r.date),
      y: data.map(r => r.disease_cases),
      name: 'Observed',
      type: 'scatter',
      mode: 'lines',
      line: { color: COLORS.actual, width: 1.5 },
    },
    {
      x: data.map(r => r.date),
      y: data.map(r => r.expected_cases),
      name: 'Expected',
      type: 'scatter',
      mode: 'lines',
      line: { color: COLORS.rolling, width: 1.5, dash: 'dot' },
    },
    {
      x: data.filter(r => r.is_anomaly === true || r.is_anomaly === 'True').map(r => r.date),
      y: data.filter(r => r.is_anomaly === true || r.is_anomaly === 'True').map(r => r.disease_cases),
      name: 'Anomaly',
      type: 'scatter',
      mode: 'markers',
      marker: { color: COLORS.anomaly, size: 10, symbol: 'diamond' },
    },
  ], {
    ...CHART_LAYOUT,
    title: { text: 'Observed vs Expected', font: { size: 12, color: '#e8f0ff' } },
    yaxis: { ...CHART_LAYOUT.yaxis, title: 'Cases' },
  }, { responsive: true, displayModeBar: false });
}

function buildRiskContribChart(contributions, signals, weights) {
  const factors = ['forecast', 'anomaly', 'environment', 'seasonal'];
  const labels = factors.map(f => f.charAt(0).toUpperCase() + f.slice(1));

  Plotly.newPlot('risk-contrib-chart', [{
    y: labels,
    x: factors.map(f => contributions[f] || 0),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: ['#00d4ff', '#f97316', '#3b82f6', '#00e5c0'],
    },
    text: factors.map(f => `Signal: ${signals[f] ?? '—'} | Weight: ${((weights[f] || 0) * 100).toFixed(0)}%`),
    textposition: 'auto',
    hovertemplate: '%{y}<br>Contribution: %{x:.1f}<br>%{text}<extra></extra>',
  }], {
    ...CHART_LAYOUT,
    title: { text: 'Risk Contribution by Factor', font: { size: 12, color: '#e8f0ff' } },
    xaxis: { ...CHART_LAYOUT.xaxis, title: 'Contribution' },
    margin: { t: 40, r: 24, b: 40, l: 100 },
  }, { responsive: true, displayModeBar: false });
}

function buildModelBenchmark(metrics, bestModel) {
  const models = ['naive', 'moving_average', 'ml_baseline'];
  const labels = ['Naive', 'Moving Average', 'ML Baseline'];
  const metricNames = ['mae', 'rmse', 'r2'];

  const traces = metricNames.map((m, i) => ({
    x: labels,
    y: models.map(mod => metrics[mod]?.[m] ?? 0),
    name: m.toUpperCase(),
    type: 'bar',
    marker: {
      color: models.map(mod => mod === bestModel ? COLORS.ml_baseline : COLORS.naive),
    },
  }));

  Plotly.newPlot('model-benchmark', traces, {
    ...CHART_LAYOUT,
    barmode: 'group',
    title: { text: 'Baseline Model Benchmark', font: { size: 12, color: '#e8f0ff' } },
  }, { responsive: true, displayModeBar: false });
}

function updateGauge(score, level) {
  const fill = document.getElementById('gauge-fill');
  const scoreEl = document.getElementById('gauge-score');
  const levelEl = document.getElementById('gauge-level');
  if (!fill) return;

  const pct = Math.min(100, Math.max(0, score)) / 100;
  const arcLength = Math.PI * 80;
  fill.style.strokeDasharray = `${arcLength}`;
  fill.style.strokeDashoffset = `${arcLength * (1 - pct)}`;
  fill.style.stroke = riskColor(level);

  if (scoreEl) scoreEl.textContent = Math.round(score);
  if (levelEl) {
    levelEl.textContent = level;
    levelEl.className = `gauge-level risk-${level}`;
  }
}

function updateQualityRing(score) {
  const ring = document.getElementById('quality-ring');
  const pct = document.getElementById('quality-pct');
  if (!ring) return;
  const circumference = 2 * Math.PI * 50;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference * (1 - score / 100)}`;
  if (pct) pct.textContent = `${score}%`;
}

window.ChartBuilders = {
  buildActivityChart,
  buildForecastChart,
  buildAnomalyChart,
  buildRiskContribChart,
  buildModelBenchmark,
  updateGauge,
  updateQualityRing,
  riskColor,
};
