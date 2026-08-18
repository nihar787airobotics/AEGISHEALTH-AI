import { motion } from "framer-motion";
import { riskColor } from "@/lib/utils";

interface RiskGaugeProps {
  score?: number;
  level?: string;
}

export function RiskGauge({ score = 0, level = "—" }: RiskGaugeProps) {
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const circumference = Math.PI * 80;
  const offset = circumference * (1 - pct);
  const color = riskColor(level);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
        <text x="100" y="82" textAnchor="middle" className="fill-white font-display text-3xl font-bold">
          {Math.round(score)}
        </text>
        <text x="100" y="102" textAnchor="middle" className="text-xs fill-white/50 tracking-widest">
          {level}
        </text>
      </svg>
    </div>
  );
}
