import { motion } from "framer-motion";
import { cn, riskColor } from "@/lib/utils";

interface MetricCardsProps {
  riskLevel?: string;
  riskScore?: number;
  anomalies?: number;
  quality?: number;
  bestModel?: string;
  regions?: number;
  loading?: boolean;
}

export function MetricCards({
  riskLevel,
  riskScore,
  anomalies,
  quality,
  bestModel,
  regions,
  loading,
}: MetricCardsProps) {
  const cards = [
    { label: "Current Risk", value: riskLevel ?? "—", accent: riskLevel ? riskColor(riskLevel) : undefined },
    { label: "Risk Score", value: riskScore != null ? Math.round(riskScore).toString() : "—" },
    { label: "Anomalies", value: anomalies?.toString() ?? "—" },
    { label: "Data Quality", value: quality != null ? `${quality}%` : "—" },
    { label: "Best Model", value: bestModel?.replace(/_/g, " ") ?? "—", small: true },
    { label: "Regions", value: regions?.toString() ?? "—" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 hover:border-aegis-cyan/25 transition-all group"
        >
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{card.label}</div>
          <div
            className={cn(
              "font-display font-bold text-white group-hover:text-aegis-cyan transition-colors",
              card.small ? "text-sm" : "text-2xl"
            )}
            style={card.accent ? { color: card.accent } : undefined}
          >
            {loading ? (
              <span className="inline-block h-7 w-16 rounded bg-white/10 animate-pulse" />
            ) : (
              card.value
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
