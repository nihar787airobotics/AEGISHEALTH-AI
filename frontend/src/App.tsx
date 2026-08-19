import { useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AegisHealthShell from "@/components/ui/saa-s-template";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { RiskNetwork3D } from "@/components/dashboard/RiskNetwork3D";
import {
  ActivityChart,
  ForecastChart,
  AnomalyChart,
  ModelBenchmarkChart,
  RiskContribChart,
} from "@/components/dashboard/Charts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatDate, formatModel } from "@/lib/utils";
import type { RegionInfo, SectionId, ForecastRecord } from "@/types/dashboard";
import { AlertTriangle, Loader2 } from "lucide-react";

function Panel({
  title,
  subtitle,
  children,
  className = "",
  id,
  highlighted = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  highlighted?: boolean;
}) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: highlighted
          ? "0 0 0 1.5px rgba(0,212,255,0.65), 0 0 32px rgba(0,212,255,0.35)"
          : "0 0 0 0px rgba(0,212,255,0)",
      }}
      transition={{ duration: 0.6 }}
      className={`glass-panel p-5 md:p-6 ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-display text-sm font-semibold text-white tracking-wide">{title}</h3>
        {subtitle && <p className="text-[11px] text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

function regionsFromRisk(risk: any): RegionInfo[] {
  if (!risk?.regions) return [];
  return Object.values(risk.regions) as RegionInfo[];
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [showHero, setShowHero] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [regionFlash, setRegionFlash] = useState(false);

  const { loading, error, health, summary, risk, forecast, anomalies, quality, models, pipeline, refresh } =
    useDashboardData();

  const handleNavigate = useCallback((section: SectionId) => {
    setShowHero(false);
    setActiveSection(section);
    setTimeout(() => {
      document.getElementById("command-center")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  const handleEnter = useCallback(() => {
    setShowHero(false);
    setTimeout(() => {
      document.getElementById("command-center")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  const handleSelectRegion = useCallback((region: string) => {
    setSelectedRegion(region);
    setRegionFlash(true);
    setTimeout(() => {
      document.getElementById("disease-activity-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    setTimeout(() => setRegionFlash(false), 1600);
  }, []);

  const regions = regionsFromRisk(risk);
  const regionList = summary?.regions ?? regions.map((r) => r.region);
  const historical = (forecast?.historical as ForecastRecord[] | undefined) ?? [];
  const predictions = (forecast?.predictions as ForecastRecord[] | undefined) ?? [];
  const pipelineStages = (pipeline?.stages as { name: string; completed: boolean }[] | undefined) ?? [];
  const modelMetrics = (models?.metrics as Record<string, Record<string, number>> | undefined) ?? {};

  return (
    <AegisHealthShell
      activeSection={activeSection}
      onNavigate={handleNavigate}
      onRefresh={refresh}
      dataMode={summary?.data_label ?? summary?.data_mode}
      lastRun={formatDate(summary?.pipeline_run_at)}
      status={health?.status as string | undefined}
      showHero={showHero}
      onEnterDashboard={handleEnter}
      riskScore={summary?.current_risk_score ?? risk?.risk_score}
      riskLevel={summary?.current_risk_level ?? risk?.risk_level}
      anomalyCount={summary?.anomaly_count ?? anomalies?.anomalies_detected}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 pb-12">
        {summary?.data_label && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-risk-moderate/30 bg-risk-moderate/5 px-4 py-2 text-xs text-risk-moderate">
            <AlertTriangle size={14} />
            {summary.data_label}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-risk-critical/30 bg-risk-critical/10 px-4 py-3 text-sm text-risk-critical">
            {error} — Ensure the FastAPI backend is running and the pipeline has been executed.
          </div>
        )}

        {loading && !summary && (
          <div className="flex items-center justify-center gap-2 py-20 text-white/50">
            <Loader2 className="animate-spin" size={20} />
            Loading intelligence pipeline…
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeSection === "overview" && (
              <div className="space-y-5">
                <MetricCards
                  riskLevel={summary?.current_risk_level ?? risk?.risk_level}
                  riskScore={summary?.current_risk_score ?? risk?.risk_score}
                  anomalies={summary?.anomaly_count ?? anomalies?.anomalies_detected}
                  quality={summary?.data_quality_score}
                  bestModel={summary?.best_model}
                  regions={summary?.region_count}
                  loading={loading}
                />
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                  <Panel title="Risk Gauge" subtitle="Current composite risk score" className="xl:col-span-1">
                    <RiskGauge score={risk?.risk_score ?? 0} level={risk?.risk_level ?? "—"} />
                  </Panel>
                  <Panel title="3D Risk Network" subtitle="Conceptual spatial intelligence" className="xl:col-span-2">
                    <RiskNetwork3D regions={regions} onSelectRegion={handleSelectRegion} />
                  </Panel>
                </div>
                <Panel
                  id="disease-activity-panel"
                  title="Disease Activity"
                  subtitle="Historical case trends"
                  highlighted={regionFlash}
                >
                  <div className="mb-3 flex gap-2 flex-wrap">
                    {["all", ...(regionList ?? [])].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRegion(r)}
                        className={`rounded-lg px-3 py-1 text-xs transition-all ${
                          selectedRegion === r
                            ? "bg-aegis-cyan/15 text-aegis-cyan border border-aegis-cyan/30"
                            : "bg-white/5 text-white/50 border border-white/10 hover:text-white"
                        }`}
                      >
                        {r === "all" ? "All Regions" : r}
                      </button>
                    ))}
                  </div>
                  <ActivityChart
                    historical={historical}
                    predictions={predictions}
                    region={selectedRegion}
                  />
                </Panel>
              </div>
            )}

            {activeSection === "forecast" && (
              <Panel title="Forecast Projections" subtitle="MODEL PREDICTION — not guaranteed outcomes">
                <ForecastChart predictions={predictions} region={selectedRegion} />
              </Panel>
            )}

            {activeSection === "anomalies" && (
              <Panel title="Anomaly Detection" subtitle="Rolling z-score deviations per region">
                <AnomalyChart records={anomalies?.records ?? historical} region={selectedRegion} />
              </Panel>
            )}

            {activeSection === "risk" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Panel title="Risk Decomposition" subtitle="Signal contributions">
                  <RiskContribChart contributions={risk?.contributions} />
                </Panel>
                <Panel title="Regional Breakdown">
                  <div className="space-y-2">
                    {regions.map((r) => (
                      <div
                        key={r.region}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
                      >
                        <span className="text-sm text-white/70">{r.region}</span>
                        <span className="font-display font-bold" style={{ color: undefined }}>
                          {r.risk_score} — {r.risk_level}
                        </span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}

            {activeSection === "data" && (
              <Panel title="Data Quality Report">
                <pre className="text-xs text-white/60 overflow-auto max-h-[400px]">
                  {JSON.stringify(quality, null, 2)}
                </pre>
              </Panel>
            )}

            {activeSection === "models" && (
              <Panel title="Model Benchmark" subtitle={`Best model: ${formatModel(summary?.best_model ?? "—")}`}>
                <ModelBenchmarkChart metrics={modelMetrics} bestModel={summary?.best_model} />
              </Panel>
            )}

            {activeSection === "system" && (
              <Panel title="Pipeline Status">
                <div className="space-y-2">
                  {pipelineStages.map((stage) => (
                    <div
                      key={stage.name}
                      className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-2"
                    >
                      <span className="text-sm text-white/70">{stage.name}</span>
                      <span className={stage.completed ? "text-aegis-teal text-xs" : "text-white/30 text-xs"}>
                        {stage.completed ? "✓ Complete" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AegisHealthShell>
  );
}
