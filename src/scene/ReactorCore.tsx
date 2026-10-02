/**
 * ReactorCore.tsx — 场景中央的「莱茵生命反应核心」
 *
 * 意象：科研装置的核心转子。数层同心环 + 悬浮晶体，整体做简谐浮动
 * (bobbing) 与自旋；环之间以不同相位反向旋转，营造精密机械的秩序感。
 * 材质为冷调金属 + 发光边缘，核心球体在能量峰值时泛警示黄。
 *
 * 所有运动同样是简谐的：y = A·sin(ωt+φ)，与晶格场共享同一时间基，
 * 保证「整个空间是一个统一的规则集合体」而非各自为政。
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../theme/palette";
import { SCENE_SPEED } from "../theme/motion";
import { mulberry32 } from "./prng";

const CORE_OMEGA = 0.9; // 与晶格同族的角频率

interface RingProps {
  radius: number;
  tube: number;
  tilt: [number, number, number];
  spinAxis: "x" | "y" | "z";
  speed: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
}

function Ring({ radius, tube, tilt, spinAxis, speed, color, emissive, emissiveIntensity }: RingProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation[spinAxis] += delta * speed * SCENE_SPEED;
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, tube, 24, 96]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={0.9}
        roughness={0.28}
      />
    </mesh>
  );
}

/** 沿核心外围环绕的一圈小晶体，做径向简谐脉动 */
function OrbitShards({ count = 14, radius = 2.5 }: { count?: number; radius?: number }) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(() => {
    const rnd = mulberry32(0x5eed);
    return Array.from({ length: count }, () => rnd() * Math.PI * 2);
  }, [count]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime * SCENE_SPEED;
    g.rotation.y = t * 0.18;
    for (let i = 0; i < g.children.length; i++) {
      const m = g.children[i] as THREE.Mesh;
      const phase = seeds[i];
      // 径向简谐脉动：沿自身朝外方向伸缩
      const pulse = Math.sin(CORE_OMEGA * t + phase);
      const r = radius + pulse * 0.42;
      const a = (i / count) * Math.PI * 2;
      m.position.set(Math.cos(a) * r, pulse * 0.55, Math.sin(a) * r);
      m.rotation.y = a + t * 0.6;
      m.rotation.x = pulse * 0.4;
      const s = 0.85 + pulse * 0.15;
      m.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color={palette.mineral}
            emissive={palette.mineralHi}
            emissiveIntensity={1.2}
            metalness={0.62}
            roughness={0.34}
          />
        </mesh>
      ))}
    </group>
  );
}

export function ReactorCore() {
  const root = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * SCENE_SPEED;
    if (root.current) {
      // 整体简谐浮动，抬高到晶格海之上成为明确焦点
      root.current.position.y = 3.1 + Math.sin(CORE_OMEGA * t) * 0.38;
      root.current.rotation.y = t * 0.12;
    }
    if (coreMat.current) {
      // 能量峰值：暖白 → 明日方舟酸黄
      const e = Math.max(0, Math.sin(CORE_OMEGA * t));
      coreMat.current.emissiveIntensity = 0.85 + e * 1.05;
      coreMat.current.emissive.setRGB(
        THREE.MathUtils.lerp(1.0, 0.99, e), // R
        THREE.MathUtils.lerp(0.85, 0.98, e), // G
        THREE.MathUtils.lerp(0.54, 0.0, e), // B（峰值抽掉蓝 → 酸黄）
      );
    }
  });

  return (
    <group ref={root} position={[0, 3.1, 0]}>
      {/* 中央能量球：暖白发光核（收敛自发光，避免炸成死白团） */}
      <mesh>
        <icosahedronGeometry args={[0.78, 1]} />
        <meshStandardMaterial
          ref={coreMat}
          color={palette.mineralHi}
          emissive="#ffcf7a"
          emissiveIntensity={1.1}
          metalness={0.45}
          roughness={0.28}
          toneMapped={false}
        />
      </mesh>

      {/* 同心环组，反向旋转——磨砂阳极金属 + 暖黄灯带 emissive（等比放大 + 提亮） */}
      <Ring
        radius={1.85}
        tube={0.05}
        tilt={[Math.PI / 2, 0, 0]}
        spinAxis="z"
        speed={0.5}
        color={palette.metalLight}
        emissive={palette.lamp}
        emissiveIntensity={1.1}
      />
      <Ring
        radius={2.5}
        tube={0.04}
        tilt={[Math.PI / 2.4, 0, 0.4]}
        spinAxis="z"
        speed={-0.34}
        color={palette.metal}
        emissive={palette.lampDeep}
        emissiveIntensity={1.3}
      />
      <Ring
        radius={3.1}
        tube={0.032}
        tilt={[Math.PI / 1.8, 0.3, -0.5]}
        spinAxis="x"
        speed={0.26}
        color={palette.metalLight}
        emissive={palette.warning}
        emissiveIntensity={0.75}
      />

      <OrbitShards radius={3.6} />
    </group>
  );
}
