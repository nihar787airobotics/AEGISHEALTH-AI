import pandas as pd

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["date"] = pd.to_datetime(out["date"], errors="coerce")
    out = out.dropna(subset=["date", "region"]).drop_duplicates().sort_values(["region", "date"])
    numeric = ["disease_cases", "temperature", "rainfall", "humidity"]
    out[numeric] = out[numeric].apply(pd.to_numeric, errors="coerce")
    for col in numeric:
        out[col] = out.groupby("region")[col].transform(lambda x: x.interpolate().bfill().ffill())
    out["disease_cases"] = out["disease_cases"].clip(lower=0).round().astype(int)
    # Cap only extreme environmental values; original raw data remains retained separately.
    for col in ["temperature", "rainfall", "humidity"]:
        lo, hi = out[col].quantile([.01, .99])
        out[col] = out[col].clip(lo, hi)
    return out.reset_index(drop=True)
