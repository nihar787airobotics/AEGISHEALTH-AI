import * as React from "react";
import { ArrowRight, Menu, X, Activity, Shield, Brain, Database, Cpu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <header className="fixed top-0 w-full z-50 border-b border-aegis-cyan/10 bg-aegis-bg/80 backdrop-blur-xl">
      <nav className="max-w-[1600px] mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-aegis-cyan/30 bg-aegis-cyan/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]">
              <span className="text-lg text-aegis-cyan">◈</span>
              <span className="absolute inset-0 rounded-xl animate-pulse-glow bg-aegis-cyan/5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold tracking-wider text-white">
                AEGISHEALTH AI
              </div>
              <div className="text-[10px] text-white/40">Predictive Public Health Intelligence</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider transition-all",
                  activeSection === item.id
                    ? "bg-aegis-cyan/15 text-aegis-cyan shadow-[0_0_16px_rgba(0,212,255,0.1)]"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
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
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-aegis-bg/95 backdrop-blur-xl border-t border-aegis-cyan/10 animate-slide-down">
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
                  activeSection === item.id ? "bg-aegis-cyan/15 text-aegis-cyan" : "text-white/60 hover:text-white"
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
              {lastRun && <p className="text-[10px] text-white/30 mt-2 text-center">Last run: {lastRun}</p>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
});

interface HeroProps {
  riskScore?: number;
  riskLevel?: string;
  anomalyCount?: number;
  onEnter: () => void;
}

export const Hero = React.memo(function Hero({ riskScore, riskLevel, anomalyCount, onEnter }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 animate-fade-in overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-[length:48px_48px] opacity-60 pointer-events-none" />

      <div
        className="absolute left-1/2 top-[15%] w-[700px] h-[400px] -translate-x-1/2 pointer-events-none opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(ellipse, rgba(0,212,255,0.3) 0%, rgba(0,229,192,0.1) 40%, transparent 70%)",
        }}
      />

      <aside className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-aegis-cyan/20 bg-aegis-cyan/5 backdrop-blur-sm">
        <span className="text-xs text-aegis-teal font-medium">BASELINE V1 — LOCAL DEMO</span>
        <span className="text-white/20">|</span>
        <span className="text-xs text-white/50">SYNTHETIC DATA — ENGINEERING DEMONSTRATION ONLY</span>
        <a href="#command-center" className="flex items-center gap-1 text-xs text-aegis-cyan hover:text-white transition-colors">
          Enter Command Center <ArrowRight size={12} />
        </a>
      </aside>

      <h1
        className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-center max-w-4xl leading-[1.05] mb-6 tracking-tight"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #ffffff 40%, rgba(0,212,255,0.7) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Public Health
        <br />
        <span className="text-aegis-cyan">AI Command Center</span>
      </h1>

      <p className="text-sm md:text-base text-center max-w-2xl text-white/50 mb-8 leading-relaxed">
        Explainable multimodal intelligence for early outbreak detection, spatial risk forecasting,
        and public-health decision support. Powered by your local Python ML pipeline.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        <Button type="button" variant="gradient" size="lg" onClick={onEnter} className="rounded-xl">
          Launch Command Center
          <ArrowRight size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-16">
        {[
          { label: "Current Risk", value: riskScore != null ? `${Math.round(riskScore)}` : "—", sub: riskLevel ?? "—" },
          { label: "Anomalies", value: anomalyCount?.toString() ?? "—", sub: "Detected" },
          { label: "Pipeline", value: "ONLINE", sub: "Local System" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 text-center hover:border-aegis-cyan/30 transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
          >
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{card.label}</div>
            <div className="font-display text-3xl font-bold text-white">{card.value}</div>
            <div className="text-xs text-aegis-cyan mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-5xl relative">
        <div
          className="absolute -top-[20%] left-1/2 w-[90%] -translate-x-1/2 pointer-events-none z-0 opacity-50"
          aria-hidden="true"
        >
          <div
            className="w-full h-48 rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.4), transparent 70%)" }}
          />
        </div>
        <div className="relative z-10 rounded-2xl border border-aegis-cyan/20 overflow-hidden shadow-[0_0_60px_rgba(0,212,255,0.12)]">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
            alt="Public health analytics dashboard preview"
            className="w-full h-auto object-cover opacity-80"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-aegis-bg via-aegis-bg/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-xs text-white/50 uppercase tracking-widest">Conceptual Risk Network Preview</p>
            <p className="text-sm text-white/70 mt-1">Interactive 3D visualization — North · Central · South regions</p>
          </div>
        </div>
      </div>
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
