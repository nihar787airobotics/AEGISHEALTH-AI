import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import type { ForecastRecord } from "@/types/dashboard";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(8,14,26,0.95)",
    border: "1px solid rgba(0,212,255,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
  },
  labelStyle: { color: "#7a8ba8" },
};

function filterRegion(data: ForecastRecord[], region: string) {
  if (region === "all") {
    const byDate: Record<string, { cases: number; rolling: number; count: number }> = {};
    data.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { cases: 0, rolling: 0, count: 0 };
      byDate[r.date].cases += Number(r.disease_cases) || 0;
      byDate[r.date].rolling += Number(r.rolling_mean_7) || 0;
      byDate[r.date].count++;
    });
    return Object.entries(byDate)
      .map(([date, v]) => ({
        date,
        disease_cases: v.cases,
        rolling_mean_7: v.rolling / v.count,
        is_anomaly: false,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  return data.filter((r) => r.region === region);
}

export function ActivityChart({
  historical = [],
  predictions = [],
  region = "all",
}: {
  historical?: ForecastRecord[];
  predictions?: ForecastRecord[];
  region?: string;
}) {
  const hist = filterRegion(historical, region);
  const pred =
    region === "all"
      ? Object.entries(
          predictions.reduce<Record<string, number>>((acc, r) => {
            acc[r.date] = (acc[r.date] || 0) + (Number(r.predicted_cases) || 0);
            return acc;
          }, {})
        ).map(([date, v]) => ({ date, predicted_cases: v }))
      : predictions.filter((r) => r.region === region);

  const anomalies = hist.filter((r) => r.is_anomaly === true || r.is_anomaly === "True");

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={hist.slice(-90)}>
          <CartesianGrid stroke="rgba(0,212,255,0.06)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: "#7a8ba8", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={{ fill: "#7a8ba8", fontSize: 10 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px", color: "#7a8ba8" }} />
          <Line type="monotone" dataKey="disease_cases" name="Observed" stroke="#00d4ff" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="rolling_mean_7" name="7-Day Avg" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {pred.length > 0 && (
        <div className="h-[120px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pred}>
              <CartesianGrid stroke="rgba(0,212,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#7a8ba8", fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#7a8ba8", fontSize: 9 }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="predicted_cases" name="Forecast (MODEL PREDICTION)" stroke="#00e5c0" fill="rgba(0,229,192,0.1)" strokeDasharray="6 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {anomalies.length > 0 && (
        <p className="text-[10px] text-risk-high mt-2">{anomalies.length} anomaly markers in selected range</p>
      )}
    </div>
  );
}

export function ForecastChart({ predictions = [], region = "all" }: { predictions?: ForecastRecord[]; region?: string }) {
  const data =
    region === "all"
      ? Object.entries(
          predictions.reduce<Record<string, number>>((acc, r) => {
            acc[r.date] = (acc[r.date] || 0) + (Number(r.predicted_cases) || 0);
            return acc;
          }, {})
        ).map(([date, v]) => ({ date, predicted_cases: v }))
      : predictions.filter((r) => r.region === region);

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5c0" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00e5c0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(0,212,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: "#7a8ba8", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={{ fill: "#7a8ba8", fontSize: 10 }} />
          <Tooltip {...tooltipStyle} />
          <Area type="monotone" dataKey="predicted_cases" name="MODEL PREDICTION" stroke="#00e5c0" fill="url(#forecastGrad)" strokeDasharray="6 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AnomalyChart({ records = [], region = "all" }: { records?: ForecastRecord[]; region?: string }) {
  const data = region === "all" ? records : records.filter((r) => r.region === region);
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.slice(-120)}>
          <CartesianGrid stroke="rgba(0,212,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: "#7a8ba8", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
          <YAxis tick={{ fill: "#7a8ba8", fontSize: 10 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line type="monotone" dataKey="disease_cases" name="Observed" stroke="#00d4ff" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="expected_cases" name="Expected" stroke="#3b82f6" dot={false} strokeDasharray="4 4" strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ModelBenchmarkChart({ metrics, bestModel }: { metrics: Record<string, any>; bestModel?: string }) {
  const data = ["naive", "moving_average", "ml_baseline"].map((name) => ({
    name: name.replace(/_/g, " "),
    mae: metrics[name]?.mae ?? 0,
    rmse: metrics[name]?.rmse ?? 0,
    isBest: name === bestModel,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(0,212,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: "#7a8ba8", fontSize: 10 }} />
          <YAxis tick={{ fill: "#7a8ba8", fontSize: 10 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="mae" name="MAE" fill="#00d4ff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rmse" name="RMSE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskContribChart({
  contributions,
}: {
  contributions?: Record<string, number>;
}) {
  const data = Object.entries(contributions ?? {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid stroke="rgba(0,212,255,0.06)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#7a8ba8", fontSize: 10 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#7a8ba8", fontSize: 10 }} width={80} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="value" name="Contribution" fill="#00d4ff" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
