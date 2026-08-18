import numpy as np
import pandas as pd

def detect_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    out=df.copy().sort_values(["region","date"])
    expected=out.groupby("region")["disease_cases"].transform(lambda x:x.shift(1).rolling(14,min_periods=7).mean())
    std=out.groupby("region")["disease_cases"].transform(lambda x:x.shift(1).rolling(14,min_periods=7).std())
    out["expected_cases"]=expected; out["anomaly_score"]=(out.disease_cases-expected)/(std.fillna(0)+1)
    out["is_anomaly"]=(out.anomaly_score>=2.5)&out.expected_cases.notna()
    return out[["date","region","disease_cases","expected_cases","anomaly_score","is_anomaly"]]
