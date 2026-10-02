/**
 * HarmonicLattice.tsx — 「规则集合体的简谐运动」
 *
 * 一片 N×N 的实例化晶格。每个元素严格服从简谐运动 (SHM):
 *      y(t) = A · sin(ω t + φ)
 * 其中相位 φ 由元素在网格中的位置决定 (φ = k·r + 方向项)，
 * 于是「单体做简谐运动、群体形成行波」——冷青色的能量波在晶格上推进。
 *
 * 位移、速度都在顶点着色器里算；着色用完全自定义的 fragment 光照模型
 * (key light + rim/fresnel + 平衡点发光 + 波峰警示黄)，以精确调出
 * 莱茵生命的冷调科研光。位移 → 颜色梯度；速度 → 穿越平衡点时的发光。
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "../theme/palette";
import { SCENE_SPEED } from "../theme/motion";
import { mulberry32 } from "./prng";

/* —— 晶格参数（可调）—— */
const GRID = 40; // 40×40 = 1600 个实例
const SPACING = 0.94; // 实例间距（拉开，让单体晶体离散可读；场域半宽 ≈ 18.8）
const AMPLITUDE = 1.2; // 振幅 A（加大，让行波更醒目）
const OMEGA = 1.35; // 角频率 ω
const WAVE_K = 0.4; // 空间波数 k（行波密度）

const vertexShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAmplitude;
  uniform float uOmega;
  uniform float uWaveK;
  uniform float uSpacing;
  uniform vec2  uWaveDir;
  uniform float uSpin;

  attribute vec2  aGrid;   // 整数网格坐标
  attribute float aSeed;   // 每实例随机相位扰动
  attribute float aScale;  // 每实例基础缩放

  varying float vHeight;   // 归一化位移 [-1,1]
  varying float vVelocity; // 归一化速度 [0,1]，用于平衡点发光
  varying vec3  vNormalW;
  varying vec3  vWorldPos;
  varying float vSeed;
  varying float vRadial;   // 距中心归一化半径，用于边缘衰减

  mat3 rotY(float a){
    float c = cos(a), s = sin(a);
    return mat3(c,0.,-s, 0.,1.,0., s,0.,c);
  }

  void main() {
    vec2 gridPos = aGrid * uSpacing;
    float dist = length(gridPos);

    // 行波相位：径向 + 方向投影，叠加每实例扰动
    float dirProj = dot(normalize(uWaveDir + vec2(1e-5)), gridPos);
    float phase = uWaveK * dist - dirProj * 0.28 + aSeed * 1.7;

    // —— 简谐运动 ——
    float arg  = uOmega * uTime + phase;
    float disp = uAmplitude * sin(arg);          // 位移 y
    float vel  = uAmplitude * uOmega * cos(arg); // 速度 dy/dt

    // 呼吸缩放 + 随高度的自旋，赋予晶格生命力
    float s = aScale * (1.0 + 0.28 * sin(arg));
    mat3 R = rotY(disp * uSpin + aSeed * 6.2831);

    vec3 local = R * (position * s);
    vec3 world = local + vec3(gridPos.x, disp, gridPos.y);

    vHeight   = disp / uAmplitude;                 // [-1,1]
    vVelocity = abs(vel) / (uAmplitude * uOmega);  // [0,1]
    vSeed     = aSeed;
    vRadial   = clamp(dist / (uSpacing * float(${GRID}) * 0.5), 0.0, 1.0);
    vNormalW  = normalize(R * normal);
    vWorldPos = (modelMatrix * vec4(world, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3  uColDeep;
  uniform vec3  uColCoolant;
  uniform vec3  uColHi;
  uniform vec3  uColWarn;
  uniform vec3  uFog;
  uniform float uFogDensity;
  uniform vec3  uKeyDir;
  uniform vec3  uKeyColor;
  uniform vec3  uRimColor;
  uniform float uRimPower;
  uniform float uEdgeFade;

  varying float vHeight;
  varying float vVelocity;
  varying vec3  vNormalW;
  varying vec3  vWorldPos;
  varying float vSeed;
  varying float vRadial;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorldPos);

    float h = clamp(vHeight * 0.5 + 0.5, 0.0, 1.0);

    // 基色：波谷橄榄 → 波峰亮卡其（暖色主体）
    vec3 base = mix(uColDeep, uColCoolant, smoothstep(0.0, 1.0, h));

    // 主光：收敛增益，让波峰落在不过曝的区间、保留晶体棱面
    float ndl = max(dot(N, normalize(uKeyDir)), 0.0);
    vec3 lit = base * (0.3 + 0.72 * ndl) * uKeyColor;

    // 高度驱动的亮度调制：波峰略亮、波谷沉入暗部，拉开行波对比
    lit *= mix(0.78, 1.06, smoothstep(-0.35, 0.95, vHeight));

    // 边缘轮廓光 (rim / fresnel) —— 仪器感冷边光（暖场里的冷声部，给棱边一点青意）
    float fres = pow(1.0 - max(dot(N, V), 0.0), uRimPower);
    vec3 rim = uRimColor * fres * (0.6 + 0.7 * vVelocity);

    // 穿越平衡点时最亮（速度最大）→ 能量感发光（收紧，避免过曝）
    vec3 emis = uColHi * pow(vVelocity, 2.5) * 0.45;

    // 波峰尖点点缀明日方舟酸黄——收窄阈值，只让最高点闪一下（克制）
    vec3 warn = uColWarn * smoothstep(0.94, 1.0, h) * 0.42;

    vec3 col = lit + rim + emis + warn;

    // 纵深雾
    float depth = length(cameraPosition - vWorldPos);
    float fogF = 1.0 - exp(-pow(depth * uFogDensity, 2.0));
    col = mix(col, uFog, clamp(fogF, 0.0, 1.0));

    // 边缘淡出：仅最外圈融进黑暗，保住场内晶格亮度（原 0.62 太早，把相机所在区压黑了）
    float fade = smoothstep(1.0, uEdgeFade, vRadial);
    col *= fade;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function buildGeometry(): THREE.InstancedBufferGeometry {
  const base = new THREE.OctahedronGeometry(0.44, 0); // 锐利晶体（放大让场更饱满）
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute("position", base.attributes.position);
  geo.setAttribute("normal", base.attributes.normal);

  const count = GRID * GRID;
  geo.instanceCount = count;

  const grid = new Float32Array(count * 2);
  const seed = new Float32Array(count);
  const scale = new Float32Array(count);

  const half = (GRID - 1) / 2;
  const rnd = mulberry32(0x1a77ce);
  let i = 0;
  for (let gx = 0; gx < GRID; gx++) {
    for (let gz = 0; gz < GRID; gz++) {
      grid[i * 2 + 0] = gx - half;
      grid[i * 2 + 1] = gz - half;
      seed[i] = rnd();
      // 中心略大、边缘略小，形成聚焦
      const r = Math.hypot(gx - half, gz - half) / half;
      scale[i] = 0.62 + 0.5 * (1.0 - Math.min(r, 1.0)) + rnd() * 0.18;
      i++;
    }
  }

  geo.setAttribute("aGrid", new THREE.InstancedBufferAttribute(grid, 2));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 1));
  geo.setAttribute("aScale", new THREE.InstancedBufferAttribute(scale, 1));

  base.dispose();
  return geo;
}

export function HarmonicLattice() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => buildGeometry(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: AMPLITUDE },
      uOmega: { value: OMEGA },
      uWaveK: { value: WAVE_K },
      uSpacing: { value: SPACING },
      uWaveDir: { value: new THREE.Vector2(0.7, 0.7).normalize() },
      uSpin: { value: 0.25 },

      uColDeep: { value: new THREE.Color(palette.mineralDeep) },
      uColCoolant: { value: new THREE.Color(palette.mineral) },
      uColHi: { value: new THREE.Color(palette.mineralHi) },
      uColWarn: { value: new THREE.Color(palette.warning) },
      uFog: { value: new THREE.Color(palette.fog) },
      uFogDensity: { value: 0.0125 }, // 降雾密度，救回暗部与前景晶格
      uKeyDir: { value: new THREE.Vector3(0.45, 1.0, 0.35).normalize() },
      uKeyColor: { value: new THREE.Color("#fff4dc") }, // 暖白漫射天光
      uRimColor: { value: new THREE.Color(palette.coolantHi) }, // 冷青轮廓光（唯一冷声部）
      uRimPower: { value: 2.5 },
      uEdgeFade: { value: 0.82 }, // 仅最外圈淡出，保住场内亮度
    }),
    [],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    // 统一时间基 × SCENE_SPEED：行波 ω·t 与波向旋转同步放缓
    const st = state.clock.elapsedTime * SCENE_SPEED;
    matRef.current.uniforms.uTime.value = st;
    // 波向缓慢旋转，让行波方向持续变化
    const t = st * 0.05;
    const dir = matRef.current.uniforms.uWaveDir.value as THREE.Vector2;
    dir.set(Math.cos(t), Math.sin(t)).normalize();
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        toneMapped={false}
      />
    </mesh>
  );
}
