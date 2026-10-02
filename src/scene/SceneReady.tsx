/**
 * SceneReady.tsx — 场景就绪信号
 *
 * 挂在 r3f Canvas 内部，首帧渲染完成后回调一次，用于提前结束 LOADING 阶段。
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function SceneReady({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}
