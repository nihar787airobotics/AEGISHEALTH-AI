"""AEGISHEALTH AI — Baseline V1 pipeline orchestrator."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import yaml

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.anomaly.detector import detect_anomalies
from src.features.feature_engineering import create_features
from src.forecasting.baseline import future_forecast, run_forecasts
from src.ingestion.loader import load_data
from src.preprocessing.preprocessing import preprocess_data
from src.preprocessing.validation import validate_data
from src.risk.risk_fusion import calculate_current_risk

OUTPUTS = ROOT / "outputs"
STAGES = [
    "DATA INGESTION",
    "VALIDATION",
    "PREPROCESSING",
    "FEATURE ENGINEERING",
    "FORECASTING",
    "ANOMALY DETECTION",
    "RISK FUSION",
    "PUBLIC HEALTH INTELLIGENCE",
]


def load_config() -> dict:
    with open(ROOT / "configs" / "config.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


def build_region_risk(
    features: pd.DataFrame,
    anomalies: pd.DataFrame,
    predictions: pd.DataFrame,
    weights: dict,
    thresholds: dict,
) -> dict:
    latest_anomalies = (
        anomalies.sort_values("date")
        .groupby("region", as_index=False)
        .tail(1)
        .set_index("region")
    )
    regions = {}
    for region in sorted(features["region"].unique()):
        region_features = features[features["region"] == region].sort_values("date")
        latest = region_features.iloc[-1].copy()
        if region in latest_anomalies.index:
            latest["anomaly_score"] = latest_anomalies.loc[region, "anomaly_score"]
        else:
            latest["anomaly_score"] = 0.0
        region_forecast = predictions[predictions["region"] == region]
        risk = calculate_current_risk(latest, region_forecast, weights, thresholds)
        risk["region"] = region
        risk["latest_cases"] = int(latest["disease_cases"])
        risk["forecast_mean"] = round(float(region_forecast["predicted_cases"].mean()), 2)
        regions[region] = risk
    return regions


def build_historical_chart(processed: pd.DataFrame, anomalies: pd.DataFrame) -> pd.DataFrame:
    chart = processed.sort_values(["region", "date"]).copy()
    chart["rolling_mean_7"] = chart.groupby("region")["disease_cases"].transform(
        lambda x: x.rolling(7, min_periods=1).mean()
    )
    anomaly_flags = anomalies[["date", "region", "is_anomaly", "anomaly_score", "expected_cases"]]
    chart = chart.merge(anomaly_flags, on=["date", "region"], how="left")
    chart["is_anomaly"] = chart["is_anomaly"].fillna(False)
    chart["anomaly_score"] = chart["anomaly_score"].fillna(0.0)
    chart["expected_cases"] = chart["expected_cases"].fillna(chart["disease_cases"])
    chart["date"] = chart["date"].dt.strftime("%Y-%m-%d")
    return chart[
        [
            "date",
            "region",
            "disease_cases",
            "rolling_mean_7",
            "expected_cases",
            "anomaly_score",
            "is_anomaly",
        ]
    ]


def print_summary(
    config: dict,
    data_mode: str,
    quality: dict,
    feature_cols: list,
    metrics: dict,
    best_model: str,
    anomaly_count: int,
    risk: dict,
) -> None:
    sep = "=" * 52
    print(sep)
    print("AEGISHEALTH AI")
    print("BASELINE V1")
    print(sep)
    print()
    print("DATA")
    print(f"Records: {quality['records']}")
    print(f"Regions: {', '.join(quality['regions'])}")
    print(f"Data mode: {data_mode}")
    print()
    print("DATA QUALITY")
    print(f"Quality: {quality['data_quality_score']}%")
    print(f"Missing: {sum(quality['missing_values'].values())}")
    print(f"Duplicates: {quality['duplicate_rows']}")
    print()
    print("FEATURES")
    temporal = [c for c in feature_cols if c.startswith(("lag_", "rolling_", "growth", "case_", "week", "month"))]
    environmental = [c for c in feature_cols if c in ("temperature", "rainfall", "humidity") or "rain" in c or "temp" in c or "humidity" in c]
    seasonal = [c for c in feature_cols if c in ("week_of_year", "month")]
    print(f"Temporal: {len(temporal)}")
    print(f"Environmental: {len(environmental)}")
    print(f"Seasonal: {len(seasonal)}")
    print()
    print("FORECASTING")
    for name in ("naive", "moving_average", "ml_baseline"):
        label = name.replace("_", " ").title()
        m = metrics[name]
        print(f"{label}:")
        print(f"  MAE  {m['mae']}")
        print(f"  RMSE {m['rmse']}")
        print(f"  R²   {m['r2']}")
    print()
    print(f"BEST MODEL: {best_model.replace('_', ' ').title()}")
    print()
    print("ANOMALIES")
    print(f"Detected: {anomaly_count}")
    print()
    print("RISK")
    signals = risk["signals"]
    print(f"Forecast:    {signals['forecast']}")
    print(f"Anomaly:     {signals['anomaly']}")
    print(f"Environment: {signals['environment']}")
    print(f"Seasonal:    {signals['seasonal']}")
    print()
    print(f"CURRENT RISK: {risk['risk_score']} / 100")
    print(f"LEVEL: {risk['risk_level']}")
    print()
    print(sep)
    print("PIPELINE COMPLETED")
    print(sep)


def run_pipeline() -> dict:
    config = load_config()
    completed_stages: list[str] = []
    errors: list[str] = []

    def mark(stage: str) -> None:
        completed_stages.append(stage)

    try:
        raw_df, data_mode = load_data(config, ROOT)
        mark("DATA INGESTION")

        quality = validate_data(raw_df)
        quality["data_mode"] = data_mode
        quality["data_label"] = "SYNTHETIC" if "SYNTHETIC" in data_mode else "USER-SUPPLIED"
        mark("VALIDATION")

        processed = preprocess_data(raw_df)
        mark("PREPROCESSING")

        features = create_features(processed)
        feature_cols = [
            "lag_1", "lag_7", "lag_14", "rolling_mean_7", "rolling_mean_14",
            "growth_rate", "case_acceleration", "week_of_year", "month",
            "temperature", "rainfall", "humidity", "rainfall_lag",
            "temperature_lag", "humidity_lag", "cumulative_rainfall",
        ]
        mark("FEATURE ENGINEERING")

        test_df, metrics, best_model, model, _ = run_forecasts(
            features,
            config["forecasting"]["test_fraction"],
            config["forecasting"]["moving_average_window"],
        )
        predictions = future_forecast(
            features, model, feature_cols, config["forecasting"]["future_horizon_days"]
        )
        mark("FORECASTING")

        anomalies = detect_anomalies(processed)
        anomaly_count = int(anomalies["is_anomaly"].sum())
        mark("ANOMALY DETECTION")

        region_risks = build_region_risk(
            features,
            anomalies,
            predictions,
            config["risk"]["weights"],
            config["risk"]["thresholds"],
        )
        overall = max(region_risks.values(), key=lambda r: r["risk_score"])
        mark("RISK FUSION")

        timestamp = datetime.now(timezone.utc).isoformat()
        historical = build_historical_chart(processed, anomalies)

        summary = {
            "project": "AEGISHEALTH AI",
            "version": "Baseline V1",
            "disease": config["project"]["disease"],
            "data_mode": data_mode,
            "data_label": quality["data_label"],
            "pipeline_run_at": timestamp,
            "records": quality["records"],
            "regions": quality["regions"],
            "region_count": len(quality["regions"]),
            "data_quality_score": quality["data_quality_score"],
            "anomaly_count": anomaly_count,
            "best_model": best_model,
            "current_risk_score": overall["risk_score"],
            "current_risk_level": overall["risk_level"],
            "highest_risk_region": overall["region"],
        }

        status = {
            "status": "COMPLETED",
            "pipeline_run_at": timestamp,
            "stages": [{"name": s, "completed": s in completed_stages} for s in STAGES],
            "completed_count": len(completed_stages),
            "total_stages": len(STAGES),
            "errors": errors,
        }

        current_risk = {
            **overall,
            "weights": config["risk"]["weights"],
            "thresholds": config["risk"]["thresholds"],
            "regions": region_risks,
        }

        OUTPUTS.mkdir(parents=True, exist_ok=True)
        write_json(OUTPUTS / "summary.json", summary)
        write_json(OUTPUTS / "data_quality" / "report.json", quality)
        write_json(OUTPUTS / "forecasting" / "metrics.json", {
            "metrics": metrics,
            "best_model": best_model,
            "test_fraction": config["forecasting"]["test_fraction"],
            "future_horizon_days": config["forecasting"]["future_horizon_days"],
            "validation": "temporal",
        })
        write_json(OUTPUTS / "risk" / "current_risk.json", current_risk)
        write_json(OUTPUTS / "pipeline" / "status.json", status)

        predictions.to_csv(OUTPUTS / "forecasting" / "predictions.csv", index=False)
        anomalies.to_csv(OUTPUTS / "anomaly" / "anomalies.csv", index=False)
        historical.to_csv(OUTPUTS / "forecasting" / "historical.csv", index=False)
        test_df[["date", "region", "disease_cases", "naive", "moving_average", "ml_baseline"]].to_csv(
            OUTPUTS / "forecasting" / "test_results.csv", index=False
        )

        mark("PUBLIC HEALTH INTELLIGENCE")
        status["stages"] = [{"name": s, "completed": s in completed_stages} for s in STAGES]
        status["completed_count"] = len(completed_stages)
        write_json(OUTPUTS / "pipeline" / "status.json", status)

        print_summary(config, data_mode, quality, feature_cols, metrics, best_model, anomaly_count, overall)
        return summary

    except Exception as exc:
        errors.append(str(exc))
        write_json(OUTPUTS / "pipeline" / "status.json", {
            "status": "FAILED",
            "pipeline_run_at": datetime.now(timezone.utc).isoformat(),
            "stages": [{"name": s, "completed": s in completed_stages} for s in STAGES],
            "completed_count": len(completed_stages),
            "total_stages": len(STAGES),
            "errors": errors,
        })
        raise


if __name__ == "__main__":
    run_pipeline()
