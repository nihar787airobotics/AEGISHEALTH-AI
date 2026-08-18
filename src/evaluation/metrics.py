import numpy as np

def regression_metrics(y_true, y_pred):
    y_true, y_pred = np.asarray(y_true, float), np.asarray(y_pred, float)
    mae = np.mean(np.abs(y_true-y_pred)); rmse = np.sqrt(np.mean((y_true-y_pred)**2))
    nonzero = y_true != 0
    mape = np.mean(np.abs((y_true[nonzero]-y_pred[nonzero])/y_true[nonzero]))*100 if nonzero.any() else float('nan')
    ss_res = ((y_true-y_pred)**2).sum(); ss_tot=((y_true-y_true.mean())**2).sum()
    return {"mae": round(float(mae),3), "rmse": round(float(rmse),3), "mape": round(float(mape),3), "r2": round(float(1-ss_res/ss_tot),3) if ss_tot else None}
