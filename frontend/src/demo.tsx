import AegisHealthShell from "@/components/ui/saa-s-template";

/** Standalone demo wrapper for the SaaS landing shell component. */
export default function Demo() {
  return (
    <AegisHealthShell
      activeSection="overview"
      onNavigate={() => {}}
      onRefresh={() => {}}
      showHero
      onEnterDashboard={() => {}}
      riskScore={42}
      riskLevel="MODERATE"
      anomalyCount={3}
    >
      <div />
    </AegisHealthShell>
  );
}
