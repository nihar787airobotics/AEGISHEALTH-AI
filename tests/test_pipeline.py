"""Tests for AEGISHEALTH AI baseline pipeline and API."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


@pytest.fixture(scope="module")
def pipeline_outputs():
    result = subprocess.run(
        [sys.executable, str(ROOT / "pipelines" / "run_baseline.py")],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    return ROOT / "outputs"


def test_pipeline_creates_outputs(pipeline_outputs):
    expected = [
        "summary.json",
        "data_quality/report.json",
        "forecasting/metrics.json",
        "forecasting/predictions.csv",
        "forecasting/historical.csv",
        "anomaly/anomalies.csv",
        "risk/current_risk.json",
        "pipeline/status.json",
    ]
    for path in expected:
        assert (pipeline_outputs / path).exists(), f"Missing {path}"


def test_summary_json_structure(pipeline_outputs):
    with open(pipeline_outputs / "summary.json") as f:
        data = json.load(f)
    for key in ("project", "data_mode", "current_risk_score", "current_risk_level", "anomaly_count", "best_model"):
        assert key in data


def test_risk_json_structure(pipeline_outputs):
    with open(pipeline_outputs / "risk" / "current_risk.json") as f:
        data = json.load(f)
    assert "risk_score" in data
    assert "signals" in data
    assert "contributions" in data
    assert "regions" in data
    assert len(data["regions"]) == 3


def test_api_health(pipeline_outputs):
    from app import app
    client = TestClient(app)
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["outputs_available"] is True


def test_api_summary(pipeline_outputs):
    from app import app
    client = TestClient(app)
    resp = client.get("/api/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["available"] is True
    assert "current_risk_score" in data


def test_api_forecast(pipeline_outputs):
    from app import app
    client = TestClient(app)
    resp = client.get("/api/forecast")
    assert resp.status_code == 200
    data = resp.json()
    assert data["available"] is True
    assert len(data["historical"]) > 0
    assert len(data["predictions"]) > 0


def test_api_regions(pipeline_outputs):
    from app import app
    client = TestClient(app)
    resp = client.get("/api/regions")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["regions"]) == 3


def test_api_region_detail(pipeline_outputs):
    from app import app
    client = TestClient(app)
    resp = client.get("/api/region/North")
    assert resp.status_code == 200
    assert resp.json()["region"] == "North"


def test_api_empty_state():
    from app import app, OUTPUTS
    import shutil
    backup = ROOT / "outputs_backup_test"
    if OUTPUTS.exists():
        if backup.exists():
            shutil.rmtree(backup)
        shutil.move(str(OUTPUTS), str(backup))
    try:
        client = TestClient(app)
        resp = client.get("/api/summary")
        assert resp.status_code == 200
        assert resp.json()["available"] is False
    finally:
        if backup.exists():
            if OUTPUTS.exists():
                shutil.rmtree(OUTPUTS)
            shutil.move(str(backup), str(OUTPUTS))
