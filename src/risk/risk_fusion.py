import numpy as np

def calculate_current_risk(latest, forecast, weights, thresholds):
    forecast_risk=float(np.clip((forecast.predicted_cases.mean()/max(1, latest.rolling_mean_14))*50,0,100))
    anomaly_risk=float(np.clip(max(0,latest.anomaly_score)*25,0,100))
    environmental_risk=float(np.clip(50+latest.rainfall_anomaly*4+latest.temperature_anomaly*5,0,100))
    seasonal_risk=float(np.clip((latest.month in [6,7,8,9,10])*70+15,0,100))
    factors={"forecast":forecast_risk,"anomaly":anomaly_risk,"environment":environmental_risk,"seasonal":seasonal_risk}
    score=sum(factors[k]*weights[k] for k in factors)
    level="LOW" if score<thresholds["low"] else "MODERATE" if score<thresholds["moderate"] else "HIGH" if score<thresholds["high"] else "CRITICAL"
    contributions={k:round(factors[k]*weights[k],2) for k in factors}
    return {"risk_score":round(score,2),"risk_level":level,"baseline_notice":"Configurable, uncalibrated baseline decision-support score; not a clinical diagnosis or guaranteed outcome.","signals":{k:round(v,2) for k,v in factors.items()},"contributions":contributions}
