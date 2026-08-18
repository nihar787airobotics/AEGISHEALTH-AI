# AEGISHEALTH AI

**Explainable Multimodal AI System for Early Disease-Outbreak Detection, Spatial Risk Forecasting, and Public-Health Decision Support**

Smart India Hackathon 2026 — PS47: Predictive Public Health Surveillance

---

## Problem

Traditional public-health surveillance is reactive: authorities notice case increases only after outbreaks become obvious. AegisHealth AI moves toward **proactive decision support** by combining temporal forecasting, anomaly detection, and risk fusion into a single local intelligence pipeline.

## Current Status — Baseline V1 (Local Demo)

This is the **first engineering milestone**. Everything runs locally on your laptop through VS Code.

| Component | Status |
|-----------|--------|
| ML pipeline (ingestion → risk fusion) | ✅ Working |
| Synthetic data generator | ✅ Working |
| Local JSON/CSV outputs | ✅ Working |
| FastAPI dashboard backend | ✅ Working |
| 3D command-center UI | ✅ Working |
| API keys / cloud / deployment | ❌ Not implemented (by design) |

### Data Mode

The current dataset is **synthetic** and explicitly labelled:

> **SYNTHETIC DATA — ENGINEERING DEMONSTRATION ONLY**

This is not real-world surveillance data. The dashboard displays this clearly.

## Architecture

```
VS Code
   │
   ▼
Python Baseline Pipeline  (pipelines/run_baseline.py)
   │
   ▼
Actual ML Computation     (src/ modules)
   │
   ▼
Local JSON / CSV outputs  (outputs/)
   │
   ▼
FastAPI Backend           (app.py)
   │
   ▼
AEGISHEALTH Dashboard     (http://localhost:8000)
```

### Pipeline Stages

```
DATA INGESTION → VALIDATION → PREPROCESSING → FEATURE ENGINEERING
      → FORECASTING → ANOMALY DETECTION → RISK FUSION → PUBLIC HEALTH INTELLIGENCE
```

### ML Modules

- **Forecasting:** Naive, Moving Average, ML Baseline (HistGradientBoosting)
- **Anomaly Detection:** Rolling z-score per region
- **Risk Fusion:** Weighted combination of forecast, anomaly, environment, seasonal signals

## Project Structure

```
AEGISHEALTH-AI/
├── app.py                      # FastAPI dashboard server
├── configs/config.yaml         # Pipeline configuration
├── pipelines/run_baseline.py   # End-to-end pipeline orchestrator
├── src/                        # ML modules (source of truth)
│   ├── ingestion/
│   ├── preprocessing/
│   ├── features/
│   ├── forecasting/
│   ├── anomaly/
│   ├── risk/
│   └── evaluation/
├── static/                     # Dashboard frontend
│   ├── index.html
│   ├── css/dashboard.css
│   └── js/
├── outputs/                    # Generated pipeline outputs (gitignored)
└── tests/
```

## Run Locally

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the baseline pipeline

```bash
python pipelines/run_baseline.py
```

This generates all outputs under `outputs/` and prints a formatted terminal summary.

### 3. Start the dashboard

```bash
uvicorn app:app --reload
```

Or:

```bash
python app.py
```

### 4. Open the dashboard

```
http://localhost:8000
```

## Output Contract

After running the pipeline, these files are created:

```
outputs/
├── summary.json
├── data_quality/report.json
├── forecasting/
│   ├── metrics.json
│   ├── predictions.csv
│   ├── historical.csv
│   └── test_results.csv
├── anomaly/anomalies.csv
├── risk/current_risk.json
└── pipeline/status.json
```

The dashboard reads these files through the API — **no hardcoded values**.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | System status |
| `GET /api/summary` | Pipeline summary |
| `GET /api/forecast` | Historical + forecast data |
| `GET /api/anomalies` | Anomaly records |
| `GET /api/risk` | Current risk score + decomposition |
| `GET /api/data-quality` | Data quality report |
| `GET /api/model-performance` | Model benchmark metrics |
| `GET /api/pipeline-status` | Pipeline stage status |
| `GET /api/regions` | Per-region risk summary |
| `GET /api/region/{region}` | Region-specific data |

## Scientific Limitations

This baseline is an **engineering demonstration**, not a production system:

- Dataset is synthetic and labelled accordingly
- Risk score is an uncalibrated baseline decision-support score
- Forecasts are model predictions, not guaranteed outcomes
- This system does **not** diagnose patients
- This system does **not** guarantee outbreaks
- No spatial graph model, SHAP, or intervention simulator yet

These belong to later development phases.

## Testing

```bash
pytest tests/ -v
```

## Future Roadmap

- Real validated epidemiological datasets
- Advanced forecasting (LSTM, TFT)
- Spatial graph neural networks
- SHAP explainability
- Intervention simulator
- Real-time ingestion
- Cloud deployment (later phase)

## License

Academic / SIH 2026 project — AegisHealth AI Team
