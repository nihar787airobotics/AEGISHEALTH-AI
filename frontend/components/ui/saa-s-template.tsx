import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import {
  ArrowRight,
  Menu,
  X,
  Activity,
  Shield,
  Brain,
  Database,
  Cpu,
  RefreshCw,
  Zap,
  Globe2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBackground3D } from "@/components/ui/HeroBackground3D";
import { cn } from "@/lib/utils";
import type { SectionId } from "@/types/dashboard";

interface NavigationProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onRefresh: () => void;
  dataMode?: string;
  lastRun?: string;
  status?: string;
}

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <Activity size={14} /> },
  { id: "forecast", label: "Forecast", icon: <Brain size={14} /> },
  { id: "anomalies", label: "Anomalies", icon: <Shield size={14} /> },
  { id: "risk", label: "Risk", icon: <Shield size={14} /> },
  { id: "data", label: "Data", icon: <Database size={14} /> },
  { id: "models", label: "Models", icon: <Cpu size={14} /> },
  { id: "system", label: "System", icon: <Cpu size={14} /> },
];

export const Navigation = React.memo(function Navigation({
  activeSection,
  onNavigate,
  onRefresh,
  dataMode,
  lastRun,
  status = "LOCAL SYSTEM ONLINE",
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled
          ? "border-b border-aegis-cyan/15 bg-aegis-bg/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,212,255,0.06)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-aegis-cyan/30 bg-aegis-cyan/10 shadow-[0_0_24px_rgba(0,212,255,0.2)]">
              <span className="text-lg text-aegis-cyan">◈</span>
              <span className="absolute inset-0 rounded-xl animate-pulse-glow bg-aegis-cyan/5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold tracking-wider text-white">
                AEGISHEALTH AI
              </div>
              <div className="text-[10px] text-white/40">Predictive Public Health Intelligence</div>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center justify-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-300",
                  activeSection === item.id
                    ? "bg-aegis-cyan/15 text-aegis-cyan shadow-[0_0_20px_rgba(0,212,255,0.12)]"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                {activeSection === item.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg border border-aegis-cyan/20 bg-aegis-cyan/5"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  {item.icon}
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="hidden xl:block text-right">
              <div className="flex items-center gap-1.5 text-[10px] text-aegis-teal">
                <span className="h-1.5 w-1.5 rounded-full bg-aegis-teal shadow-[0_0_8px_#00e5c0] animate-pulse" />
                {status}
              </div>
              <div className="text-[10px] text-white/40 truncate max-w-[180px]">
                {dataMode ?? "SYNTHETIC DEMO"}
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-aegis-bg/95 backdrop-blur-2xl border-t border-aegis-cyan/10"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors text-left",
                    activeSection === item.id
                      ? "bg-aegis-cyan/15 text-aegis-cyan"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <div className="pt-3 border-t border-white/10 mt-2">
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={onRefresh}>
                  <RefreshCw size={14} /> Refresh Analysis
                </Button>
                {lastRun && (
                  <p className="text-[10px] text-white/30 mt-2 text-center">Last run: {lastRun}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

interface HeroProps {
  riskScore?: number;
  riskLevel?: string;
  anomalyCount?: number;
  onEnter: () => void;
}

const FEATURES = [
  { icon: Brain, label: "AI Forecasting", desc: "Multimodal temporal models" },
  { icon: Shield, label: "Anomaly Detection", desc: "Early outbreak signals" },
  { icon: Globe2, label: "Spatial Risk", desc: "Regional risk network" },
  { icon: Zap, label: "Real-time Pipeline", desc: "Local ML computation" },
];

export const Hero = React.memo(function Hero({ riskScore, riskLevel, anomalyCount, onEnter }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden">
      <HeroBackground3D />

      <div className="absolute inset-0 bg-grid-pattern bg-[length:48px_48px] opacity-40 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-radial-glow pointer-events-none z-[1]" />

      <motion.aside
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative z-10 mb-8 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-aegis-cyan/25 bg-aegis-cyan/5 backdrop-blur-md glow-cyan"
      >
        <Sparkles size={12} className="text-aegis-cyan" />
        <span className="text-xs text-aegis-teal font-medium">BASELINE V1 — LOCAL DEMO</span>
        <span className="text-white/20 hidden sm:inline">|</span>
        <span className="text-xs text-white/50 hidden sm:inline">
          SYNTHETIC DATA — ENGINEERING DEMONSTRATION ONLY
        </span>
        <a
          href="#command-center"
          className="flex items-center gap-1 text-xs text-aegis-cyan hover:text-white transition-colors"
        >
          Enter Command Center <ArrowRight size={12} />
        </a>
      </motion.aside>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7 }}
        className="relative z-10 font-display text-4xl md:text-6xl lg:text-7xl font-bold text-center max-w-4xl leading-[1.05] mb-6 tracking-tight text-gradient-aegis"
      >
        Public Health
        <br />
        <span className="text-aegis-cyan">AI Command Center</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 text-sm md:text-base text-center max-w-2xl text-white/50 mb-8 leading-relaxed"
      >
        Explainable multimodal intelligence for early outbreak detection, spatial risk forecasting,
        and public-health decision support. Powered by your local Python ML pipeline.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 flex flex-wrap items-center justify-center gap-4 mb-12"
      >
        <Button type="button" variant="gradient" size="lg" onClick={onEnter} className="rounded-xl group">
          Launch Command Center
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-12"
      >
        {[
          {
            label: "Current Risk",
            value: riskScore != null ? `${Math.round(riskScore)}` : "—",
            sub: riskLevel ?? "—",
          },
          { label: "Anomalies", value: anomalyCount?.toString() ?? "—", sub: "Detected" },
          { label: "Pipeline", value: "ONLINE", sub: "Local System" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="glass-panel p-5 text-center hover:border-aegis-cyan/30 transition-all hover:shadow-[0_0_40px_rgba(0,212,255,0.1)]"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{card.label}</div>
            <div className="font-display text-3xl font-bold text-white">{card.value}</div>
            <div className="text-xs text-aegis-cyan mt-1">{card.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.8 }}
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl mb-16"
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08 }}
            className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm hover:border-aegis-cyan/20 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aegis-cyan/10 text-aegis-cyan">
              <f.icon size={18} />
            </div>
            <div className="text-xs font-medium text-white/80">{f.label}</div>
            <div className="text-[10px] text-white/40 text-center">{f.desc}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 1, duration: 0.9, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl perspective-1000"
      >
        <div
          className="absolute -top-[25%] left-1/2 w-[95%] -translate-x-1/2 pointer-events-none z-0 opacity-60"
          aria-hidden="true"
        >
          <div
            className="w-full h-56 rounded-full blur-3xl animate-pulse-glow"
            style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.45), rgba(0,229,192,0.15), transparent 70%)" }}
          />
        </div>

        <div className="relative z-10 preserve-3d">
          <div className="rounded-2xl border border-aegis-cyan/25 overflow-hidden shadow-[0_0_80px_rgba(0,212,255,0.15)] glow-cyan transform hover:scale-[1.01] transition-transform duration-700">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80"
              alt="Public health analytics dashboard preview"
              className="w-full h-auto object-cover opacity-85"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-aegis-bg via-aegis-bg/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <p className="text-xs text-aegis-cyan uppercase tracking-widest font-medium">
                Interactive 3D Risk Network
              </p>
              <p className="text-sm text-white/70 mt-1">
                North · Central · South regions — live spatial intelligence visualization
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 -top-4 hidden md:block rounded-xl border border-aegis-teal/30 bg-aegis-bg/90 backdrop-blur-xl p-3 shadow-xl"
          >
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Risk Level</div>
            <div className="font-display text-xl font-bold text-aegis-teal">{riskLevel ?? "—"}</div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-4 top-1/3 hidden md:block rounded-xl border border-aegis-cyan/30 bg-aegis-bg/90 backdrop-blur-xl p-3 shadow-xl"
          >
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Anomalies</div>
            <div className="font-display text-xl font-bold text-aegis-cyan">{anomalyCount ?? "—"}</div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
});

interface AegisHealthShellProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onRefresh: () => void;
  dataMode?: string;
  lastRun?: string;
  status?: string;
  showHero: boolean;
  onEnterDashboard: () => void;
  riskScore?: number;
  riskLevel?: string;
  anomalyCount?: number;
  children: React.ReactNode;
}

export default function AegisHealthShell({
  activeSection,
  onNavigate,
  onRefresh,
  dataMode,
  lastRun,
  status,
  showHero,
  onEnterDashboard,
  riskScore,
  riskLevel,
  anomalyCount,
  children,
}: AegisHealthShellProps) {
  return (
    <main className="min-h-screen bg-aegis-bg text-white">
      <Navigation
        activeSection={activeSection}
        onNavigate={onNavigate}
        onRefresh={onRefresh}
        dataMode={dataMode}
        lastRun={lastRun}
        status={status}
      />
      {showHero ? (
        <Hero
          riskScore={riskScore}
          riskLevel={riskLevel}
          anomalyCount={anomalyCount}
          onEnter={onEnterDashboard}
        />
      ) : (
        <div id="command-center" className="pt-20">
          {children}
        </div>
      )}
    </main>
  );
}
