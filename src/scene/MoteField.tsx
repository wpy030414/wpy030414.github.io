/**
 * MoteField.tsx — 空间中的悬浮能量微粒
 *
 * 上千个点，每个沿竖直方向做简谐运动 y = A·sin(ωt+φ)，相位随机。
 * 它们不是装饰噪点，而是「规则集合体」的一部分——同属一套简谐法则。
 * 用 AdditiveBlending + 自定义 point shader，靠近波峰时点亮。
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../theme/palette";
import { SCENE_SPEED } from "../theme/motion";
import { mulberry32 } from "./prng";

const COUNT = 1600;
const SPREAD_XZ = 22;
const SPREAD_Y = 12;

const vertexShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute vec3  aBase;   // 初始位置
  attribute float aPhase;  // 简谐相位
  attribute float aAmp;    // 振幅
  attribute float aOmega;  // 角频率

  varying float vGlow;

  void main() {
    float y = aBase.y + aAmp * sin(aOmega * uTime + aPhase);
    vec3 pos = vec3(aBase.x, y, aBase.z);

    // 速度越大（穿越平衡点）越亮
    float vel = abs(aAmp * aOmega * cos(aOmega * uTime + aPhase));
    vGlow = clamp(vel * 0.6, 0.15, 1.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z) * (0.6 + vGlow);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform vec3 uColorHot;
  varying float vGlow;

  void main() {
    // 圆形软点
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColor, uColorHot, vGlow);
    gl_FragColor = vec4(col, alpha * (0.35 + vGlow * 0.65));
  }
`;

export function MoteField() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const base = new Float32Array(COUNT * 3);
    const phase = new Float32Array(COUNT);
    const amp = new Float32Array(COUNT);
    const omega = new Float32Array(COUNT);
    // position 属性需要一个占位（shader 用 aBase，但 three 需要 position 计算包围盒）
    const position = new Float32Array(COUNT * 3);

    const rnd = mulberry32(0xc0ffee);
    for (let i = 0; i < COUNT; i++) {
      const x = (rnd() - 0.5) * SPREAD_XZ;
      const y = (rnd() - 0.5) * SPREAD_Y;
      const z = (rnd() - 0.5) * SPREAD_XZ;
      base[i * 3 + 0] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      position[i * 3 + 0] = x;
      position[i * 3 + 1] = y;
      position[i * 3 + 2] = z;
      phase[i] = rnd() * Math.PI * 2;
      amp[i] = 0.4 + rnd() * 1.6;
      omega[i] = 0.4 + rnd() * 0.9;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("aBase", new THREE.BufferAttribute(base, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    geo.setAttribute("aAmp", new THREE.BufferAttribute(amp, 1));
    geo.setAttribute("aOmega", new THREE.BufferAttribute(omega, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), SPREAD_XZ);
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 26 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uColor: { value: new THREE.Color(palette.lamp) },
      uColorHot: { value: new THREE.Color(palette.mineralHi) },
    }),
    [],
  );

  useFrame((state) => {
    if (matRef.current)
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime * SCENE_SPEED;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
