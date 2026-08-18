import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatModel(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function riskColor(level: string) {
  const map: Record<string, string> = {
    LOW: "#22c55e",
    MODERATE: "#eab308",
    HIGH: "#f97316",
    CRITICAL: "#ef4444",
  };
  return map[level] ?? "#00d4ff";
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
