import numpy as np
import pandas as pd
from src.evaluation.metrics import regression_metrics

def run_forecasts(features: pd.DataFrame, test_fraction: float, window: int):
    from sklearn.ensemble import HistGradientBoostingRegressor
    feature_cols = ["lag_1","lag_7","lag_14","rolling_mean_7","rolling_mean_14","growth_rate","case_acceleration","week_of_year","month","temperature","rainfall","humidity","rainfall_lag","temperature_lag","humidity_lag","cumulative_rainfall"]
    usable = features.dropna(subset=feature_cols).copy()
    split = int(len(usable)*(1-test_fraction)); train, test = usable.iloc[:split], usable.iloc[split:]
    test["naive"] = test["lag_1"]
    test["moving_average"] = test["rolling_mean_7"]
    model = HistGradientBoostingRegressor(max_iter=150, learning_rate=.06, max_leaf_nodes=12, random_state=42)
    model.fit(train[feature_cols], train.disease_cases)
    test["ml_baseline"] = np.maximum(0, model.predict(test[feature_cols]))
    metrics = {n: regression_metrics(test.disease_cases, test[n]) for n in ["naive","moving_average","ml_baseline"]}
    best = min(metrics, key=lambda x: metrics[x]["mae"])
    return test, metrics, best, model, feature_cols

def future_forecast(features, model, feature_cols, horizon):
    # Recursive case lags with last observed environmental values; model prediction, not guaranteed outcome.
    rows=[]; working=features.copy(); regions=working.region.unique()
    for _ in range(horizon):
        for region in regions:
            history=working[working.region==region].sort_values("date")
            last=history.iloc[-1].copy(); row=last.copy(); row["date"]=last.date+pd.Timedelta(days=1)
            row["lag_1"]=last.disease_cases; row["lag_7"]=history.disease_cases.iloc[-7]; row["lag_14"]=history.disease_cases.iloc[-14]
            row["rolling_mean_7"]=history.disease_cases.iloc[-7:].mean(); row["rolling_mean_14"]=history.disease_cases.iloc[-14:].mean()
            row["growth_rate"]=(row.lag_1-row.lag_7)/max(1,row.lag_7); row["case_acceleration"]=0; row["week_of_year"]=int(row.date.isocalendar().week); row["month"]=row.date.month
            pred=max(0, float(model.predict(pd.DataFrame([row])[feature_cols])[0])); row["disease_cases"]=round(pred)
            rows.append({"date":row.date,"region":region,"actual_cases":None,"predicted_cases":round(pred,2),"model":"ML baseline — MODEL PREDICTION"}); working=pd.concat([working,pd.DataFrame([row])],ignore_index=True)
    return pd.DataFrame(rows)
