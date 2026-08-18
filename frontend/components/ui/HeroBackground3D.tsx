import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Line } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 48;

  const { sphereA, sphereB, lines } = useMemo(() => {
    const a: [number, number, number][] = [];
    const b: [number, number, number][] = [];
    const l: [[number, number, number], [number, number, number]][] = [];

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const y = (i / count) * 5 - 2.5;
      const x1 = Math.cos(t) * 0.9;
      const z1 = Math.sin(t) * 0.9;
      const x2 = Math.cos(t + Math.PI) * 0.9;
      const z2 = Math.sin(t + Math.PI) * 0.9;
      a.push([x1, y, z1]);
      b.push([x2, y, z2]);
      if (i % 3 === 0) l.push([[x1, y, z1], [x2, y, z2]]);
    }
    return { sphereA: a, sphereB: b, lines: l };
  }, [count]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[2.8, 0, -1]}>
      {sphereA.map((pos, i) => (
        <mesh key={`a-${i}`} position={pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {sphereB.map((pos, i) => (
        <mesh key={`b-${i}`} position={pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#00e5c0" emissive="#00e5c0" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {lines.map(([start, end], i) => (
        <Line
          key={`l-${i}`}
          points={[new THREE.Vector3(...start), new THREE.Vector3(...end)]}
          color="#00d4ff"
          transparent
          opacity={0.2}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

function OrbitingRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.08;
  });
  return (
    <group ref={ref} position={[-3, 0.5, -2]}>
      {[1.2, 1.6, 2.0].map((r, i) => (
        <mesh key={r} rotation={[Math.PI / 2 + i * 0.15, 0, 0]}>
          <torusGeometry args={[r, 0.012, 8, 64]} />
          <meshBasicMaterial color={i === 0 ? "#00d4ff" : i === 1 ? "#00e5c0" : "#3b82f6"} transparent opacity={0.35 - i * 0.08} />
        </mesh>
      ))}
    </group>
  );
}

function PulseCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.12;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={ref} position={[0, 0, -3]}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial
          color="#00d4ff"
          wireframe
          transparent
          opacity={0.18}
          emissive="#00d4ff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={1.4} color="#00d4ff" />
      <pointLight position={[-4, -2, 3]} intensity={0.7} color="#00e5c0" />
      <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={0.6} />
      <PulseCore />
      <DNAHelix />
      <OrbitingRings />
    </>
  );
}

export function HeroBackground3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(0,229,192,0.06) 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
