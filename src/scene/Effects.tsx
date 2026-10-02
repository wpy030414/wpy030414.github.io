/**
 * Effects.tsx — 后处理链
 *
 * 为场景注入「莱茵生命」的光影气质：
 *  - Bloom(mipmapBlur)：让波峰、核心、边缘光产生暖冽辉光
 *  - ChromaticAberration：仅画面边缘色散 (radialModulation)，精密仪器镜头感
 *  - Noise：细颗粒胶片噪点，避免大面积暗场色带 (banding)
 *  - Vignette：暗角聚焦中心装置
 *  - ToneMapping(ACES)：电影级色调映射——★ 全场景唯一一次，renderer 侧已关
 *  - SMAA：抗锯齿，硬直角 HUD 边缘 + 晶格细边不锯齿
 *
 * 链顺序：Bloom → CA → Noise → Vignette → ToneMapping → SMAA
 * 数值偏克制——这是精密科研仪器的暖调冷边光，不是赛博朋克的滥彩。
 */
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  ToneMapping,
  SMAA,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";

const CA_OFFSET = new THREE.Vector2(0.0006, 0.0008);

export function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.66}
        luminanceThreshold={0.44}
        luminanceSmoothing={0.3}
        mipmapBlur
        radius={0.7}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={CA_OFFSET}
        radialModulation
        modulationOffset={0.32}
      />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.3} />
      <Vignette eskil={false} offset={0.28} darkness={0.84} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}
