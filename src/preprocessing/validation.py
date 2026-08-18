import pandas as pd
from src.ingestion.loader import REQUIRED_COLUMNS

def validate_data(df: pd.DataFrame) -> dict:
    missing_columns = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    parsed = pd.to_datetime(df["date"], errors="coerce")
    numeric = ["disease_cases", "temperature", "rainfall", "humidity"]
    invalid_numeric = int((df[numeric].apply(pd.to_numeric, errors="coerce").isna() & ~df[numeric].isna()).sum().sum())
    negative = int((pd.to_numeric(df["disease_cases"], errors="coerce") < 0).sum())
    quality = max(0.0, 100 - (df.isna().sum().sum() / max(1, df.size) * 100) - (df.duplicated().mean() * 100) - (parsed.isna().mean() * 100) - negative * 100 / max(1,len(df)))
    return {"records": len(df), "date_range": {"start": str(parsed.min().date()), "end": str(parsed.max().date())}, "missing_values": df.isna().sum().to_dict(), "duplicate_rows": int(df.duplicated().sum()), "invalid_dates": int(parsed.isna().sum()), "invalid_numeric_values": invalid_numeric, "negative_case_counts": negative, "regions": sorted(df["region"].dropna().astype(str).unique().tolist()), "data_quality_score": round(quality, 2)}
