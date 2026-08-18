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
  const [forecast, setForecast] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<AnomalyData | null>(null);
  const [quality, setQuality] = useState<any>(null);
  const [models, setModels] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [regions, setRegions] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  const load = useCallback(async () => {
    try {
      const [h, s, r, f, a, q, m, p, reg] = await Promise.all([
        api.health(),
        api.summary(),
        api.risk(),
        api.forecast(),
        api.anomalies(),
        api.dataQuality(),
        api.modelPerformance(),
        api.pipelineStatus(),
        api.regions(),
      ]);
      setHealth(h);
      setSummary(s);
      setRisk(r);
      setForecast(f);
      setAnomalies(a);
      setQuality(q);
      setModels(m);
      setPipeline(p);
      setRegions(reg);
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
