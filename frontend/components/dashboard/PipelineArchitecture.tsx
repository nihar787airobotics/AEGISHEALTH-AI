import { motion } from "framer-motion";
import { Check, Clock, CircleDot } from "lucide-react";
import type { BuildStatus, PipelineArchStage } from "@/types/dashboard";

// Source of truth for what's actually implemented in src/ + pipelines/run_baseline.py
// vs. what's on the roadmap (see PS47 spec, sections 10/13/15/20/26).
// Update this list as phases land — it drives the whole page.
export const PIPELINE_STAGES: PipelineArchStage[] = [
  {
    id: "ingestion",
    name: "Data ingestion",
    detail: "Synthetic dengue generator (seasonal + rainfall-driven) with schema-validated loader",
    status: "built",
  },
  {
    id: "preprocessing",
    name: "Preprocessing & validation",
    detail: "Interpolation, outlier clipping, duplicate/date checks, data quality score",
    status: "built",
  },
  {
    id: "features",
    name: "Feature engineering",
    detail: "Lags (1/7/14), rolling means, growth rate, case acceleration, environmental anomalies",
    status: "built",
  },
  {
    id: "forecasting",
    name: "Forecasting",
    detail: "Naive + moving average baselines vs. HistGradientBoosting, compared on MAE",
    status: "built",
  },
  {
    id: "anomaly",
    name: "Anomaly detection",
    detail: "Rolling 14-day z-score per region, flagged at 2.5σ",
    status: "built",
  },
  {
    id: "spatial",
    name: "Spatial / graph AI",
    detail: "GNN over districts using adjacency + mobility — not started",
    status: "planned",
  },
  {
    id: "risk-fusion",
    name: "Risk fusion engine",
    detail: "Weighted forecast + anomaly + environment + seasonal signals → 0–100 score",
    status: "built",
  },
  {
    id: "explainability",
    name: "Explainability (SHAP)",
    detail: "Per-prediction factor attribution for \"why is this region high-risk\"",
    status: "planned",
  },
  {
    id: "uncertainty",
    name: "Uncertainty estimation",
    detail: "Prediction intervals / conformal methods — risk score is currently a point estimate",
    status: "planned",
  },
  {
    id: "simulator",
    name: "Intervention simulator",
    detail: "Compare no-intervention vs. early-intervention scenarios, model-based only",
    status: "planned",
  },
  {
    id: "alerts",
    name: "Early warning & decision support",
    detail: "Dashboard risk levels live; automated GREEN/YELLOW/ORANGE/RED alerts + recommendations planned",
    status: "partial",
  },
  {
    id: "monitoring",
    name: "Real data & model monitoring",
    detail: "Swap synthetic data for validated sources (e.g. IDSP/NVBDCP); drift + retraining tracking",
    status: "planned",
  },
];

const STATUS_META: Record<
  BuildStatus,
  { label: string; dot: string; badgeBg: string; badgeText: string; badgeBorder: string; icon: React.ReactNode }
> = {
  built: {
    label: "Built",
    dot: "bg-aegis-teal shadow-[0_0_10px_#00e5c0]",
    badgeBg: "bg-aegis-teal/10",
    badgeText: "text-aegis-teal",
    badgeBorder: "border-aegis-teal/30",
    icon: <Check size={11} />,
  },
  partial: {
    label: "Partial",
    dot: "bg-risk-moderate shadow-[0_0_10px_#eab308]",
    badgeBg: "bg-risk-moderate/10",
    badgeText: "text-risk-moderate",
    badgeBorder: "border-risk-moderate/30",
    icon: <CircleDot size={11} />,
  },
  planned: {
    label: "Planned",
    dot: "bg-white/25",
    badgeBg: "bg-white/5",
    badgeText: "text-white/45",
    badgeBorder: "border-white/15",
    icon: <Clock size={11} />,
  },
};

function StatusBadge({ status }: { status: BuildStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}

export function PipelineArchitecture() {
  const builtCount = PIPELINE_STAGES.filter((s) => s.status === "built").length;
  const plannedCount = PIPELINE_STAGES.filter((s) => s.status === "planned").length;
  const partialCount = PIPELINE_STAGES.filter((s) => s.status === "partial").length;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-[11px] text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-aegis-teal shadow-[0_0_8px_#00e5c0]" />
          {builtCount} built
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-risk-moderate shadow-[0_0_8px_#eab308]" />
          {partialCount} partial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/25" />
          {plannedCount} planned
        </span>
        <span className="ml-auto text-white/30">OBSERVE → DETECT → PREDICT → LOCALIZE → EXPLAIN → SIMULATE → RECOMMEND</span>
      </div>

      <div className="relative pl-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/10" />
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage, i) => {
            const meta = STATUS_META[stage.status];
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="relative"
              >
                <span
                  className={`absolute -left-6 top-4 h-2.5 w-2.5 rounded-full ${meta.dot}`}
                />
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-sm font-medium text-white">{stage.name}</span>
                    <StatusBadge status={stage.status} />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">{stage.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
