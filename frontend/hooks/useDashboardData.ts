import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  AnomalyData,
  RiskData,
  SummaryData,
} from "@/types/dashboard";

export function useDashboardData(pollMs = 10000) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [risk, setRisk] = useState<RiskData | null>(null);
  const [forecast, setForecast] = useState<Record<string, unknown> | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyData | null>(null);
  const [quality, setQuality] = useState<Record<string, unknown> | null>(null);
  const [models, setModels] = useState<Record<string, unknown> | null>(null);
  const [pipeline, setPipeline] = useState<Record<string, unknown> | null>(null);
  const [regions, setRegions] = useState<Record<string, unknown> | null>(null);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    try {
      const [h, s, r, f, a, q, m, p, reg] = await Promise.all([
        api.health(),
        api.summary() as Promise<SummaryData>,
        api.risk() as Promise<RiskData>,
        api.forecast(),
        api.anomalies() as Promise<AnomalyData>,
        api.dataQuality(),
        api.modelPerformance(),
        api.pipelineStatus(),
        api.regions(),
      ]);
      setHealth(h as Record<string, unknown>);
      setSummary(s);
      setRisk(r);
      setForecast(f as Record<string, unknown>);
      setAnomalies(a);
      setQuality(q as Record<string, unknown>);
      setModels(m as Record<string, unknown>);
      setPipeline(p as Record<string, unknown>);
      setRegions(reg as Record<string, unknown>);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  return {
    loading,
    error,
    health,
    summary,
    risk,
    forecast,
    anomalies,
    quality,
    models,
    pipeline,
    regions,
    refresh: load,
  };
}
