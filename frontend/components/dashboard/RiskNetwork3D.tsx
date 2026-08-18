import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import type { RegionInfo } from "@/types/dashboard";
import { riskColor } from "@/lib/utils";

const POSITIONS: Record<string, [number, number, number]> = {
  North: [0, 1.4, 0.4],
  Central: [-1.1, -0.2, 0.7],
  South: [1.0, -0.9, 0.2],
};

function GlobeWireframe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.12;
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.08) * 0.08;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.6, 2]} />
      <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.12} />
    </mesh>
  );
}

function RegionNode({
  region,
  onSelect,
}: {
  region: RegionInfo;
  onSelect: (name: string) => void;
}) {
  const pos = POSITIONS[region.region] ?? [0, 0, 0];
  const color = riskColor(region.risk_level);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scale = 0.1 + (region.risk_score / 100) * 0.06;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.5 + region.risk_score * 0.05) * 0.1;
      meshRef.current.scale.setScalar(scale * pulse * (hovered ? 1.3 : 1));
    }
  });

  return (
    <group position={pos}>
      <Sphere
        ref={meshRef}
        args={[scale, 24, 24]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(region.region)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.2 : 0.6}
          transparent
          opacity={0.95}
        />
      </Sphere>
      <Sphere args={[scale * 2, 16, 16]}>
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.2 : 0.08} />
      </Sphere>
      {hovered && (
        <Html distanceFactor={8} position={[0, scale + 0.3, 0]}>
          <div className="rounded-lg border border-aegis-cyan/30 bg-aegis-bg/95 px-3 py-2 text-xs backdrop-blur-md shadow-xl whitespace-nowrap pointer-events-none">
            <div className="font-bold text-aegis-cyan">{region.region}</div>
            <div className="text-white/60">Cases: {region.latest_cases ?? "—"}</div>
            <div className="text-white/60">Forecast: {region.forecast_mean ?? "—"}</div>
            <div style={{ color }}>{region.risk_score} — {region.risk_level}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function ConnectionLines({ regions }: { regions: RegionInfo[] }) {
  const points = regions.map((r) => new THREE.Vector3(...(POSITIONS[r.region] ?? [0, 0, 0])));
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      lines.push(
        <Line
          key={`${i}-${j}`}
          points={[points[i], points[j]]}
          color="#00d4ff"
          transparent
          opacity={0.25}
          lineWidth={1}
        />
      );
    }
  }
  return <>{lines}</>;
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const count = 150;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 7;

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.04;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00d4ff" size={0.025} transparent opacity={0.5} />
    </points>
  );
}

interface RiskNetwork3DProps {
  regions: RegionInfo[];
  onSelectRegion: (region: string) => void;
}

export function RiskNetwork3D({ regions, onSelectRegion }: RiskNetwork3DProps) {
  return (
    <div className="h-[340px] w-full rounded-2xl border border-aegis-cyan/10 bg-black/30 overflow-hidden relative">
      <div className="absolute top-3 left-4 z-10 text-[10px] uppercase tracking-widest text-white/40">
        Conceptual Risk Network
      </div>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#00d4ff" />
        <pointLight position={[-3, -2, 2]} intensity={0.6} color="#00e5c0" />
        <GlobeWireframe />
        <ParticleField />
        <ConnectionLines regions={regions} />
        {regions.map((r) => (
          <RegionNode key={r.region} region={r} onSelect={onSelectRegion} />
        ))}
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}
