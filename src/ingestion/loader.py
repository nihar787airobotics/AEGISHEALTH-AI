from pathlib import Path
import numpy as np
import pandas as pd

REQUIRED_COLUMNS = ["date", "region", "disease_cases", "temperature", "rainfall", "humidity"]

def generate_synthetic_data(path: Path, days: int, regions: list[str], seed: int) -> pd.DataFrame:
    """Create clearly-labelled, epidemiologically plausible test data; never real surveillance data."""
    rng = np.random.default_rng(seed)
    dates = pd.date_range("2024-01-01", periods=days, freq="D")
    rows = []
    for idx, region in enumerate(regions):
        phase = idx * 0.6
        for day, date in enumerate(dates):
            seasonal = np.sin(2 * np.pi * (day - 145) / 365 + phase)
            rain = max(0, 7 + 6 * seasonal + rng.gamma(1.5, 2))
            temp = 28 + 3.5 * np.sin(2 * np.pi * (day - 85) / 365 + phase) + rng.normal(0, .8)
            humidity = np.clip(68 + 14 * seasonal + rng.normal(0, 4), 35, 98)
            recent_rain = 0.20 * rain
            outbreak = 13 if (day % 235 in range(0, 12) and idx == 1) else 0
            lam = max(1, 6 + idx * 2 + 4 * max(seasonal, 0) + recent_rain + outbreak)
            rows.append((date, region, rng.poisson(lam), temp, rain, humidity, "SYNTHETIC"))
    df = pd.DataFrame(rows, columns=REQUIRED_COLUMNS + ["data_label"])
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    return df

def load_data(config: dict, root: Path) -> tuple[pd.DataFrame, str]:
    custom = root / "data" / "raw" / "dengue_data.csv"
    if custom.exists():
        return pd.read_csv(custom), "USER-SUPPLIED CSV"
    path = root / "data" / "synthetic" / "synthetic_dengue_daily.csv"
    df = generate_synthetic_data(path, config["data"]["synthetic_days"], config["data"]["regions"], config["project"]["random_seed"])
    return df, "SYNTHETIC DATA — ENGINEERING DEMONSTRATION ONLY"
