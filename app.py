"""AEGISHEALTH AI — Local FastAPI dashboard backend."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent
OUTPUTS = ROOT / "outputs"
STATIC = ROOT / "static"

app = FastAPI(title="AEGISHEALTH AI", version="Baseline V1")
app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


def read_json(path: Path) -> dict | None:
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def sanitize_value(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, float) and (pd.isna(value) or value != value):
        return None
    if isinstance(value, (pd.Timestamp,)):
        return str(value)
    return value


def read_csv(path: Path) -> list[dict] | None:
    if not path.exists():
        return None
    df = pd.read_csv(path)
    records = df.to_dict(orient="records")
    return [
        {key: sanitize_value(val) for key, val in row.items()}
        for row in records
    ]


def outputs_available() -> bool:
    return (OUTPUTS / "summary.json").exists()


def no_analysis_response() -> dict:
    return {
        "available": False,
        "message": "NO ANALYSIS AVAILABLE",
        "instruction": "Run the baseline pipeline to generate results: python pipelines/run_baseline.py",
    }


@app.get("/")
async def index():
    return FileResponse(STATIC / "index.html")


@app.get("/api/health")
async def health():
    return {
        "status": "LOCAL SYSTEM ONLINE",
        "version": "Baseline V1",
        "outputs_available": outputs_available(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/summary")
async def summary():
    data = read_json(OUTPUTS / "summary.json")
    if not data:
        return no_analysis_response()
    return {"available": True, **data}


@app.get("/api/data-quality")
async def data_quality():
    data = read_json(OUTPUTS / "data_quality" / "report.json")
    if not data:
        return no_analysis_response()
    return {"available": True, **data}


@app.get("/api/model-performance")
async def model_performance():
    data = read_json(OUTPUTS / "forecasting" / "metrics.json")
    if not data:
        return no_analysis_response()
    return {"available": True, **data}


@app.get("/api/pipeline-status")
async def pipeline_status():
    data = read_json(OUTPUTS / "pipeline" / "status.json")
    if not data:
        return {
            "available": False,
            "status": "NOT RUN",
            "message": "Pipeline has not been executed yet.",
            "stages": [],
        }
    return {"available": True, **data}


@app.get("/api/risk")
async def risk():
    data = read_json(OUTPUTS / "risk" / "current_risk.json")
    if not data:
        return no_analysis_response()
    return {"available": True, **data}


@app.get("/api/anomalies")
async def anomalies():
    records = read_csv(OUTPUTS / "anomaly" / "anomalies.csv")
    if records is None:
        return no_analysis_response()
    flagged = [r for r in records if r.get("is_anomaly") in (True, "True", 1, "1")]
    latest = max(flagged, key=lambda r: r["date"], default=None) if flagged else None
    highest = max(records, key=lambda r: float(r.get("anomaly_score") or 0), default=None)
    return {
        "available": True,
        "total_observations": len(records),
        "anomalies_detected": len(flagged),
        "latest_anomaly": latest,
        "highest_anomaly": highest,
        "records": records,
    }


@app.get("/api/forecast")
async def forecast():
    historical = read_csv(OUTPUTS / "forecasting" / "historical.csv")
    predictions = read_csv(OUTPUTS / "forecasting" / "predictions.csv")
    if historical is None or predictions is None:
        return no_analysis_response()
    return {
        "available": True,
        "historical": historical,
        "predictions": predictions,
        "prediction_label": "MODEL PREDICTION — not actual cases",
    }


@app.get("/api/regions")
async def regions():
    risk = read_json(OUTPUTS / "risk" / "current_risk.json")
    if not risk or "regions" not in risk:
        return no_analysis_response()
    region_list = []
    for name, info in risk["regions"].items():
        region_list.append({
            "region": name,
            "risk_score": info["risk_score"],
            "risk_level": info["risk_level"],
            "latest_cases": info.get("latest_cases"),
            "forecast_mean": info.get("forecast_mean"),
            "signals": info.get("signals", {}),
        })
    return {"available": True, "regions": region_list}


@app.get("/api/region/{region}")
async def region_detail(region: str):
    risk = read_json(OUTPUTS / "risk" / "current_risk.json")
    if not risk or "regions" not in risk:
        raise HTTPException(status_code=404, detail="No analysis available")
    if region not in risk["regions"]:
        raise HTTPException(status_code=404, detail=f"Region '{region}' not found")

    historical = read_csv(OUTPUTS / "forecasting" / "historical.csv") or []
    predictions = read_csv(OUTPUTS / "forecasting" / "predictions.csv") or []
    anomalies = read_csv(OUTPUTS / "anomaly" / "anomalies.csv") or []

    return {
        "available": True,
        "region": region,
        "risk": risk["regions"][region],
        "historical": [r for r in historical if r["region"] == region],
        "predictions": [r for r in predictions if r["region"] == region],
        "anomalies": [r for r in anomalies if r["region"] == region and r.get("is_anomaly") in (True, "True", 1, "1")],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
