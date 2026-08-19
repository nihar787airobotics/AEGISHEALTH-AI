


# ◈ AEGISHEALTH AI

### Explainable Multimodal AI for Early Disease-Outbreak Detection, Risk Forecasting & Public-Health Decision Support

**Smart India Hackathon 2026 · PS47 — Predictive Public Health Surveillance**

> **OBSERVE → DETECT → PREDICT → FUSE → EXPLAIN → DECIDE**

---

## 🧭 What is AegisHealth AI?

**AegisHealth AI** is a public-health intelligence platform designed to move disease surveillance from a reactive workflow toward **early, explainable, data-driven risk intelligence**.

The current target disease is **Dengue**.

The first milestone establishes a complete local baseline:

```text
Disease + Environmental Signals
              ↓
        Data Ingestion
              ↓
        Data Validation
              ↓
         Preprocessing
              ↓
      Feature Engineering
              ↓
     ┌────────┴────────┐
     ↓                 ↓
 Forecasting      Anomaly Detection
     ↓                 ↓
     └────────┬────────┘
              ↓
         Risk Fusion
              ↓
     Public-Health Risk
              ↓
     AegisHealth Command Center
````

> **Current milestone: Baseline V1 — Local Engineering Demonstration**

Everything currently runs locally.

No API keys, paid APIs, cloud services, databases, or deployment infrastructure are required.

---

# ⚠️ Current Data Status

### `SYNTHETIC DATA — ENGINEERING DEMONSTRATION ONLY`

The current baseline uses a **synthetic Dengue dataset** generated to validate the complete engineering pipeline.

It is **not real-world surveillance data**.

| Property         | Current Value         |
| ---------------- | --------------------- |
| Disease          | Dengue                |
| Data mode        | Synthetic             |
| Regions          | North, Central, South |
| Synthetic period | 730 days              |
| Forecast horizon | 14 days               |
| Random seed      | 42                    |

The next major scientific milestone is replacing the synthetic input with **validated real epidemiological and environmental datasets**.

---

# 🧠 Current Pipeline

## 1. Data Ingestion

Loads the current disease/environment dataset while keeping the data source explicitly labelled.

## 2. Data Validation

Checks:

* required columns
* missing values
* duplicate records
* invalid dates
* invalid numerical values
* negative disease counts
* region availability
* date range

## 3. Preprocessing

Sorts, cleans, aligns and prepares observations for modelling.

## 4. Feature Engineering

Current features include:

* 1-day, 7-day and 14-day case lags
* 7-day and 14-day rolling averages
* growth rate
* case acceleration
* week of year
* month/seasonality
* rainfall lag
* temperature lag
* humidity lag
* rainfall anomaly
* temperature anomaly
* cumulative rainfall

Historical features are constructed without intentionally using future observations.

## 5. Forecasting

Three baseline approaches are compared:

| Model                    | Purpose                        |
| ------------------------ | ------------------------------ |
| **Naive**                | Simplest reference baseline    |
| **Moving Average**       | Historical short-term baseline |
| **HistGradientBoosting** | Current ML baseline            |

Evaluation uses chronological time-series splitting.

Metrics:

* MAE
* RMSE
* R²

## 6. Anomaly Detection

For each region, expected disease activity is estimated from previous observations.

The system then calculates an anomaly score:

```text
Observed Cases
      -
Expected Cases
      ↓
Anomaly Score
      ↓
Potential Anomaly
```

## 7. Risk Fusion

The current baseline combines:

```text
Forecast Risk       × 35%
Anomaly Risk        × 30%
Environmental Risk  × 20%
Seasonal Risk       × 15%
                     ↓
              BASELINE RISK
```

Risk levels:

```text
0–25     LOW
25–50    MODERATE
50–75    HIGH
75–100   CRITICAL
```

The current score is a **configurable, uncalibrated baseline decision-support score**.

It is not a clinical diagnosis and does not guarantee an outbreak.

---

# 🖥️ AegisHealth Command Center

The project contains a local visual interface designed as a **Public Health AI Command Center**.

The frontend uses:

* React
* TypeScript
* Vite
* Three.js / React Three Fiber
* Recharts
* Framer Motion

The backend uses:

* Python
* FastAPI
* Uvicorn

### UI Direction

The interface is designed around a futuristic but professional public-health aesthetic:

* dark command-center styling
* glass-style information panels
* animated risk indicators
* interactive charts
* conceptual 3D risk network
* regional risk visualization
* forecasting analytics
* anomaly intelligence
* model benchmarking
* data-quality monitoring

The current 3D network is **conceptual**, not a claim of accurate geographic propagation.

---

# 🔄 ML → Backend → Dashboard

The Python pipeline is the **single source of truth**.

The frontend does not contain fake model values.

```text
┌───────────────────────────────┐
│ TERMINAL 1                    │
│ Python Baseline Pipeline      │
│                               │
│ run_baseline.py               │
└──────────────┬────────────────┘
               ↓
┌───────────────────────────────┐
│ outputs/                      │
│                               │
│ summary.json                  │
│ forecasting/                  │
│ anomaly/                     │
│ risk/                        │
│ data_quality/                │
│ pipeline/                    │
└──────────────┬────────────────┘
               ↓
┌───────────────────────────────┐
│ TERMINAL 2                    │
│ FastAPI                       │
│ Local Backend                 │
└──────────────┬────────────────┘
               ↓
┌───────────────────────────────┐
│ TERMINAL 3                    │
│ React + Vite                  │
│ npm run dev                   │
└──────────────┬────────────────┘
               ↓
      AEGISHEALTH COMMAND CENTER
```

When the Python pipeline generates new results, the dashboard displays those actual results.

---

# 🚀 Run Locally

## Prerequisites

Install:

* Python 3.10+
* Node.js 18+
* npm
* Git

Open the repository in VS Code.

Example:

```powershell
cd "C:\AEGISHEALTH AI\AEGISHEALTH-AI"
```

---

# 🟢 TERMINAL 1 — Install Requirements + Run Baseline

Open **Terminal 1** in VS Code.

### Step 1 — Install Python dependencies

Run this once:

```powershell
pip install -r requirements.txt
C:\AEGISHEALTH AI\AEGISHEALTH-AI> cd pipelines
C:\AEGISHEALTH AI\AEGISHEALTH-AI\pipelines> python run_baseline.py
```
 C:\AEGISHEALTH AI\AEGISHEALTH-AI> cd pipelines
 C:\AEGISHEALTH AI\AEGISHEALTH-AI\pipelines> python run_baseline.py

This installs the local Python stack:

* pandas
* numpy
* matplotlib
* PyYAML
* scikit-learn
* pytest
* FastAPI
* Uvicorn
* HTTPX

### Step 2 — Run the baseline

In the same Terminal 1:

```powershell
python pipelines/run_baseline.py
```

The pipeline performs:

```text
Load Data
   ↓
Validate
   ↓
Preprocess
   ↓
Feature Engineering
   ↓
Forecasting
   ↓
Anomaly Detection
   ↓
Risk Fusion
   ↓
Generate Outputs
```

The terminal prints:

* dataset information
* data quality
* feature engineering status
* Naive metrics
* Moving Average metrics
* ML baseline metrics
* best model
* anomaly count
* risk signals
* final risk score

---

# 🔵 TERMINAL 2 — Start FastAPI Backend

Open a **second VS Code terminal**.

From the repository root:

```terminal 2
C:\AEGISHEALTH AI\AEGISHEALTH-AI> uvicorn app:app --reload --port 8001
```

The backend will normally run at:

```text
http://127.0.0.1:8000
```

You can also run:

```powershell
python app.py
```

---

## ⚠️ Windows Port Issue

If you see:

```text
[WinError 10013]
An attempt was made to access a socket in a way forbidden by its access permissions
```

use another port:

```powershell
uvicorn app:app --reload --port 8001
```

If you use port `8001`, update:

```text
frontend/vite.config.ts
```

from:

```text
http://127.0.0.1:8000
```

to:

```text
http://127.0.0.1:8001
```

Then restart the frontend.

---

# 🟣 TERMINAL 3 — Start React Frontend

Open a **third VS Code terminal**.

Move into the frontend:

```powershell
 C:\AEGISHEALTH AI> cd AEGISHEALTH-AI
 C:\AEGISHEALTH AI\AEGISHEALTH-AI> cd frontend
 C:\AEGISHEALTH AI\AEGISHEALTH-AI\frontend> npm install
 C:\AEGISHEALTH AI\AEGISHEALTH-AI\frontend> npm run dev
```

Install JavaScript dependencies once:

```powershell
npm install
```

Then start the development server:

```powershell
npm run dev
```

Vite normally starts at:

```text
http://localhost:5173
```

Open that address in your browser.

---

# ⚡ Quick 3-Terminal Workflow

### Terminal 1

```powershell
pip install -r requirements.txt
python pipelines/run_baseline.py
```

### Terminal 2

```powershell
uvicorn app:app --reload --port 8000
```

### Terminal 3

```powershell
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

> `npm install` only needs to be run the first time or when frontend dependencies change. After that, use `npm run dev`.

---

# 📊 Generated Outputs

After running the baseline:

```text
outputs/
│
├── summary.json
│
├── data_quality/
│   └── report.json
│
├── forecasting/
│   ├── metrics.json
│   ├── predictions.csv
│   ├── historical.csv
│   └── test_results.csv
│
├── anomaly/
│   └── anomalies.csv
│
├── risk/
│   └── current_risk.json
│
└── pipeline/
    └── status.json
```

These files contain the actual results used by the dashboard.

---

# 🔌 Local API

The FastAPI backend exposes:

| Endpoint                 | Purpose                      |
| ------------------------ | ---------------------------- |
| `/api/health`            | System status                |
| `/api/summary`           | Overall pipeline summary     |
| `/api/forecast`          | Historical + forecast data   |
| `/api/anomalies`         | Anomaly records              |
| `/api/risk`              | Current risk + decomposition |
| `/api/data-quality`      | Data quality                 |
| `/api/model-performance` | Forecasting metrics          |
| `/api/pipeline-status`   | Pipeline stage status        |
| `/api/regions`           | Regional risk summary        |
| `/api/region/{region}`   | Region-specific analysis     |

Example:

```text
http://127.0.0.1:8000/api/health
```

---

# 🗂️ Project Structure

```text
AEGISHEALTH-AI/
│
├── app.py
├── requirements.txt
├── readme.md
│
├── configs/
│   └── config.yaml
│
├── pipelines/
│   └── run_baseline.py
│
├── src/
│   ├── ingestion/
│   ├── preprocessing/
│   ├── features/
│   ├── forecasting/
│   ├── anomaly/
│   ├── risk/
│   └── evaluation/
│
├── outputs/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│
├── static/
│
└── tests/
```

---

# 🧪 Testing

From the repository root:

```powershell
pytest tests/ -v
```

Tests cover the core pipeline components.

---


# 🔬 Scientific Methodology

### Forecasting

Chronological time-series evaluation is used rather than random shuffling.

### Feature Engineering

Historical lag and rolling features use previous observations.

### Anomaly Detection

Expected disease activity is calculated from historical regional observations.

### Risk Fusion

The current risk score is a configurable baseline and is not yet calibrated as a real epidemiological probability.

### Data Provenance

Synthetic data is explicitly labelled as synthetic.

---

# 🚧 Current Limitations

This is **Baseline V1**, not the final AegisHealth platform.

Not yet implemented:

* ❌ Real epidemiological dataset integration
* ❌ Real weather/environmental data integration
* ❌ Validated geographic coordinates
* ❌ Spatial GNN / GAT / ST-GNN
* ❌ SHAP explainability
* ❌ Prediction calibration and uncertainty
* ❌ Intervention simulator
* ❌ Real-time streaming
* ❌ Production cloud deployment
* ❌ Multi-disease production deployment

---

# 🗺️ Roadmap

```text
PHASE 1
Baseline Engineering
        ↓
PHASE 2
Real Epidemiological + Environmental Data
        ↓
PHASE 3
Advanced Forecasting
        ↓
PHASE 4
Advanced Anomaly Detection
        ↓
PHASE 5
Spatial / Graph Intelligence
        ↓
PHASE 6
Risk Fusion + Calibration
        ↓
PHASE 7
SHAP + Uncertainty
        ↓
PHASE 8
Intervention Simulation
        ↓
PHASE 9
Command Center Enhancement
        ↓
PHASE 10
Validated Deployment
```

---

# 🛡️ Responsible AI

AegisHealth AI is a **public-health decision-support research prototype**.

It:

* does not diagnose patients
* does not replace public-health professionals
* does not guarantee an outbreak
* does not present synthetic data as real surveillance
* does not treat the current risk score as a calibrated probability

Real-world deployment would require validated datasets, epidemiological evaluation, calibration, uncertainty analysis, and human oversight.

---

# 🏁 Current Milestone

## Baseline V1 — Local Engineering Demonstration

### Implemented

* ✅ Synthetic Dengue data pipeline
* ✅ Data validation
* ✅ Preprocessing
* ✅ Temporal feature engineering
* ✅ Environmental feature engineering
* ✅ Naive forecasting baseline
* ✅ Moving-average baseline
* ✅ HistGradientBoosting ML baseline
* ✅ Chronological evaluation
* ✅ Region-wise anomaly detection
* ✅ Configurable risk fusion
* ✅ Local JSON/CSV output contract
* ✅ FastAPI backend
* ✅ React/Vite frontend
* ✅ 3D command-center visual layer

### Next Milestone

> **Replace synthetic inputs with validated real-world epidemiological and environmental data, then benchmark advanced models against the established baseline.**

---

# ◈ AEGISHEALTH AI

### From surveillance data to actionable risk intelligence.

**OBSERVE → DETECT → PREDICT → LOCALIZE → EXPLAIN → SIMULATE → RECOMMEND**

````

### One correction I strongly recommend before you commit this

Because your current `frontend/vite.config.ts` proxies `/api` to **port 8000**, your normal setup should be:

```text
Terminal 1 → baseline
Terminal 2 → Uvicorn :8000
Terminal 3 → npm run dev
````



