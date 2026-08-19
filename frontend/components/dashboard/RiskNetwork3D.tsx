import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html, useTexture } from "@react-three/drei";
import { Component, Suspense, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import type { RegionInfo } from "@/types/dashboard";
import { riskColor } from "@/lib/utils";

const REGION_DIRECTIONS: Record<string, [number, number, number]> = {
  North: [0, 1.4, 0.4],
  Central: [-1.1, -0.2, 0.7],
  South: [1.0, -0.9, 0.2],
};

// Public NASA-derived Earth texture set shipped with three-globe.
// Swap these for locally hosted assets if you want to avoid the unpkg CDN dependency.
const EARTH_MAP = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const EARTH_BUMP = "https://unpkg.com/three-globe/example/img/earth-topology.png";
const EARTH_SPEC = "https://unpkg.com/three-globe/example/img/earth-water.png";
// NOTE: the cloud texture lives in a different folder than the other earth maps
const EARTH_CLOUDS = "https://unpkg.com/three-globe/example/clouds/clouds.png";

const GLOBE_RADIUS = 1.6;
// Sit region markers just above the earth + cloud shell (radius ~1.62) so they
// aren't depth-occluded inside the now-opaque globe — the raw REGION_DIRECTIONS
// above are just directions; this rescales each to a fixed distance from center.
const MARKER_RADIUS = GLOBE_RADIUS + 0.12;

function toSurfacePosition([x, y, z]: [number, number, number]): [number, number, number] {
  const len = Math.hypot(x, y, z) || 1;
  const scale = MARKER_RADIUS / len;
  return [x * scale, y * scale, z * scale];
}

const POSITIONS: Record<string, [number, number, number]> = Object.fromEntries(
  Object.entries(REGION_DIRECTIONS).map(([key, dir]) => [key, toSurfacePosition(dir)])
) as Record<string, [number, number, number]>;

function EarthSurface() {
  const ref = useRef<THREE.Mesh>(null);
  const [colorMap, bumpMap, specularMap] = useTexture([EARTH_MAP, EARTH_BUMP, EARTH_SPEC]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.06;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshPhongMaterial
        map={colorMap}
        bumpMap={bumpMap}
        bumpScale={0.04}
        specularMap={specularMap}
        specular="#223344"
        shininess={6}
      />
    </mesh>
  );
}

function CloudLayer() {
  const ref = useRef<THREE.Mesh>(null);
  const cloudsMap = useTexture(EARTH_CLOUDS);

  useFrame(({ clock }) => {
    if (ref.current) {
      // drifts slightly faster than the land/water surface for a parallax effect
      ref.current.rotation.y = clock.getElapsedTime() * 0.078;
    }
  });

  return (
    <mesh ref={ref} scale={1.012}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={cloudsMap}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        uniforms={{ glowColor: { value: new THREE.Color("#00d4ff") } }}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            gl_FragColor = vec4(glowColor, clamp(intensity, 0.0, 1.0));
          }
        `}
      />
    </mesh>
  );
}

function GlobeFallback() {
  // lightweight wireframe placeholder shown while the earth/cloud textures stream in
  // (and permanently, if a texture ever fails to load — see GlobeErrorBoundary below)
  return (
    <mesh>
      <icosahedronGeometry args={[GLOBE_RADIUS, 2]} />
      <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.12} />
    </mesh>
  );
}

// If a texture 404s or the CDN is unreachable, useTexture's promise rejects and
// Suspense can't catch that — it would otherwise crash the whole dashboard.
// This boundary catches it and quietly drops back to the wireframe globe instead.
class GlobeErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Realistic globe failed to load, falling back to wireframe:", error);
  }
  render() {
    if (this.state.hasError) return <GlobeFallback />;
    return this.props.children;
  }
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
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scale = 0.1 + (region.risk_score / 100) * 0.06;

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.5 + region.risk_score * 0.05) * 0.1;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scale * pulse * (hovered ? 1.3 : 1));
    }
    if (haloRef.current) {
      const haloPulse = 1 + Math.sin(clock.getElapsedTime() * 1.6 + region.risk_score * 0.05) * 0.25;
      haloRef.current.scale.setScalar(scale * 2.6 * haloPulse * (hovered ? 1.4 : 1));
    }
  });

  return (
    <group position={pos}>
      {/* real light source, so the risk color actually washes across the textured
          surface beneath it instead of just sitting on top as a flat marker */}
      <pointLight color={color} intensity={hovered ? 3.2 : 1.5} distance={1.6} decay={2} />
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
          emissiveIntensity={hovered ? 1.6 : 0.9}
          transparent
          opacity={0.95}
        />
      </Sphere>
      <Sphere ref={haloRef} args={[scale, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.3 : 0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
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
        <ambientLight intensity={0.25} />
        {/* warm "sun" key light so the realistic texture reads naturally instead of being tinted cyan */}
        <pointLight position={[5, 3, 5]} intensity={1.6} color="#fff2e0" />
        {/* cool fill light from the dark side, kept subtle so it acts as a rim accent, not a full tint */}
        <pointLight position={[-4, -2, -3]} intensity={0.35} color="#00d4ff" />
        <GlobeErrorBoundary>
          <Suspense fallback={<GlobeFallback />}>
            <EarthSurface />
            <CloudLayer />
            <Atmosphere />
          </Suspense>
        </GlobeErrorBoundary>
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
