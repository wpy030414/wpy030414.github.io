/**
 * CameraRig.tsx — 运镜
 *
 * 缓慢的轨道漂移 (orbit drift) + 鼠标视差 (parallax)。相机不锁死，
 * 而是绕核心做极低频的圆周运动，让晶格行波与透视持续变化，
 * 空间「活」起来。鼠标移动带来克制的视差偏移，给出交互反馈。
 *
 * 用 THREE.MathUtils.damp 做帧率无关的指数平滑，避免生硬。
 * lookAt 始终略高于核心，形成仰望装置的构图。
 */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE_SPEED } from "../theme/motion";

const ORBIT_RADIUS = 12.0; // 收进场内，让晶格铺满画面
const ORBIT_HEIGHT = 8.6; // 抬高，形成约 35° 俯视角，晶格如海面铺开
const ORBIT_SPEED = 0.045; // 极低频
const PARALLAX = 1.6; // 鼠标视差强度
const LOOK_AT_Y = 1.8; // 视线落在晶格海与抬高后的核心之间
const LAMBDA = 2.4; // 阻尼系数：越大越快逼近

export function CameraRig() {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, LOOK_AT_Y, 0));
  const desired = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    // 轨道漂移与浮游随 SCENE_SPEED 放缓；鼠标视差保持即时响应（不受影响）
    const t = state.clock.elapsedTime * SCENE_SPEED;

    // 基础轨道漂移
    const a = t * ORBIT_SPEED;
    const ox = Math.cos(a) * ORBIT_RADIUS;
    const oz = Math.sin(a) * ORBIT_RADIUS;

    // 鼠标视差（pointer 为 [-1,1]）
    desired.current.set(
      ox + pointer.x * PARALLAX,
      ORBIT_HEIGHT + pointer.y * PARALLAX * 0.6 + Math.sin(t * 0.3) * 0.4,
      oz,
    );

    // 帧率无关的指数阻尼逼近。
    // 在 useFrame 渲染循环里就地修改 camera 是 r3f / three.js 的标准命令式写法，
    // React Compiler 的 immutability 规则不理解渲染循环，此处有意为之。
    /* oxlint-disable react/immutability */
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desired.current.x, LAMBDA, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desired.current.y, LAMBDA, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desired.current.z, LAMBDA, delta);

    camera.lookAt(target.current);
    /* oxlint-enable react/immutability */
  });

  return null;
}
