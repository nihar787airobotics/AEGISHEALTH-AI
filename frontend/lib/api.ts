const API = "/api";

async function fetchJSON<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API}/${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  health: () => fetchJSON<{ status: string; outputs_available: boolean }>("health"),
  summary: () => fetchJSON("summary"),
  risk: () => fetchJSON("risk"),
  forecast: () => fetchJSON("forecast"),
  anomalies: () => fetchJSON("anomalies"),
  dataQuality: () => fetchJSON("data-quality"),
  modelPerformance: () => fetchJSON("model-performance"),
  pipelineStatus: () => fetchJSON("pipeline-status"),
  regions: () => fetchJSON("regions"),
  region: (name: string) => fetchJSON(`region/${name}`),
};
