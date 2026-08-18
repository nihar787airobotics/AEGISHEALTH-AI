import pandas as pd

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.sort_values(["region", "date"]).copy()
    g = out.groupby("region", group_keys=False)
    for lag in [1, 7, 14]: out[f"lag_{lag}"] = g["disease_cases"].shift(lag)
    out["rolling_mean_7"] = g["disease_cases"].transform(lambda x: x.shift(1).rolling(7, min_periods=3).mean())
    out["rolling_mean_14"] = g["disease_cases"].transform(lambda x: x.shift(1).rolling(14, min_periods=5).mean())
    out["growth_rate"] = g["disease_cases"].pct_change().replace([float("inf"), -float("inf")], 0).fillna(0)
    out["case_acceleration"] = g["growth_rate"].diff().fillna(0)
    out["week_of_year"] = out.date.dt.isocalendar().week.astype(int)
    out["month"] = out.date.dt.month
    for col in ["rainfall", "temperature", "humidity"]:
        out[f"{col}_lag"] = g[col].shift(7)
        out[f"{col}_anomaly"] = out[col] - g[col].transform(lambda x: x.shift(1).rolling(30, min_periods=7).mean())
    out["cumulative_rainfall"] = g["rainfall"].transform(lambda x: x.shift(1).rolling(14, min_periods=3).sum())
    return out
