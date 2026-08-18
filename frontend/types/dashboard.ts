export interface SummaryData {
  available: boolean;
  project?: string;
  version?: string;
  disease?: string;
  data_mode?: string;
  data_label?: string;
  pipeline_run_at?: string;
  records?: number;
  regions?: string[];
  region_count?: number;
  data_quality_score?: number;
  anomaly_count?: number;
  best_model?: string;
  current_risk_score?: number;
  current_risk_level?: string;
  highest_risk_region?: string;
  message?: string;
  instruction?: string;
}

export interface RegionInfo {
  region: string;
  risk_score: number;
  risk_level: string;
  latest_cases?: number;
  forecast_mean?: number;
  signals?: Record<string, number>;
}

export interface RiskData {
  available: boolean;
  risk_score?: number;
  risk_level?: string;
  signals?: Record<string, number>;
  contributions?: Record<string, number>;
  weights?: Record<string, number>;
  regions?: Record<string, RegionInfo & { contributions?: Record<string, number> }>;
  baseline_notice?: string;
}

export interface ForecastRecord {
  date: string;
  region: string;
  disease_cases?: number;
  rolling_mean_7?: number;
  expected_cases?: number;
  anomaly_score?: number;
  is_anomaly?: boolean | string;
  predicted_cases?: number;
  actual_cases?: number | null;
}

export interface AnomalyData {
  available: boolean;
  total_observations?: number;
  anomalies_detected?: number;
  latest_anomaly?: ForecastRecord | null;
  highest_anomaly?: ForecastRecord | null;
  records?: ForecastRecord[];
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  mape?: number;
  r2: number | null;
}

export interface PipelineStage {
  name: string;
  completed: boolean;
}

export type SectionId =
  | "overview"
  | "forecast"
  | "anomalies"
  | "risk"
  | "data"
  | "models"
  | "system";
