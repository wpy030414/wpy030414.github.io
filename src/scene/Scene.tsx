/**
 * Scene.tsx — 3D 场景合成
 *
 * 把灯光、简谐晶格场、反应核心、悬浮微粒、运镜与后处理组装进一个
 * r3f Canvas。背景与雾统一为暖近黑（莱茵生命暗场），让晶格从黑暗中浮现。
 *
 * 关键修正：
 *  - gl.toneMapping 设为 NoToneMapping，避免与后处理链里的 ToneMapping effect
 *    双重应用 ACES（r3f 默认会给渲染器开 ACESFilmic → 标准材质被调两次 → 发灰）。
 *    色调映射统一交给 EffectComposer 里的那一次。
 *  - 补 Environment（Lightformer 程序化环境光），暗场 + 磨砂金属没有 envMap 会死黑。
 *  - 相机初始位对齐 CameraRig 在 t=0 的轨道点 [12, 8.6, 0]，避免开场跳变。
 */
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { palette } from "../theme/palette";
import { Lights } from "./Lights";
import { HarmonicLattice } from "./HarmonicLattice";
import { ReactorCore } from "./ReactorCore";
import { MoteField } from "./MoteField";
import { CameraRig } from "./CameraRig";
import { Effects } from "./Effects";
import { SceneReady } from "./SceneReady";

export function Scene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      className="scene-canvas"
      gl={{
        antialias: false, // 交给后处理 SMAA
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        toneMapping: THREE.NoToneMapping, // ★ 避免与后处理双重 tone mapping
        toneMappingExposure: 0.95, // 暗调：压回曝光，保住行波明暗对比
      }}
      dpr={[1, 2]}
      camera={{ position: [12, 8.6, 0], fov: 42, near: 0.1, far: 140 }}
    >
      <color attach="background" args={[palette.void]} />
      <fogExp2 attach="fog" args={[palette.fog, 0.014]} />

      <Suspense fallback={null}>
        <Lights />

        {/* 程序化环境光：暖白顶光 + 暖黄侧光 + 一抹冷青反调，喂给磨砂金属 */}
        <Environment resolution={256} environmentIntensity={0.3}>
          <Lightformer intensity={2.2} color="#fff4dc" position={[0, 6, -9]} scale={[12, 12, 1]} />
          <Lightformer intensity={1.3} color={palette.lamp} position={[-6, 1, -1]} scale={[3, 9, 1]} />
          <Lightformer intensity={0.7} color={palette.coolant} position={[6, 2, 2]} scale={[3, 7, 1]} />
        </Environment>

        <HarmonicLattice />
        <ReactorCore />
        <MoteField />
        <Effects />
      </Suspense>

      <CameraRig />
      {onReady && <SceneReady onReady={onReady} />}
    </Canvas>
  );
}
