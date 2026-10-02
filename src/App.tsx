/**
 * App.tsx — 应用根组件
 *
 * 职责：
 *  1. 挂载 3D 场景 (Scene) 作为全屏背景层
 *  2. 挂载 HUD 编排层 (Hud) 覆盖其上
 *  3. 用 useBootSequence 驱动一次有剧本的入场转场
 *  4. 平滑推进加载进度，3D 首帧就绪后快速补齐
 *
 * 3D 场景常驻不卸载；引导幕、扫描线等只是它上面的 HUD 效果。
 */
import { useCallback, useEffect, useState } from "react";
import { Scene } from "./scene/Scene";
import { Hud } from "./hud/Hud";
import { useBootSequence } from "./hooks/useBootSequence";
import { UI_TIME_SCALE } from "./theme/motion";

function App() {
  const [sceneReady, setSceneReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  // 惰性初始化：减少动态偏好直接满进度，避免 effect 内同步 setState
  const [progress, setProgress] = useState(() => (reducedMotion ? 1 : 0));

  const onReady = useCallback(() => setSceneReady(true), []);

  // 平滑推进加载进度：就绪前缓爬到 0.82，就绪后补齐到 1
  useEffect(() => {
    if (reducedMotion) return; // 惰性初始化已置为 1
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const target = sceneReady ? 1 : 0.82;
      // 进度爬升速度随 UI_TIME_SCALE 放缓，与调慢后的引导幕时长同步
      const speed = (sceneReady ? 4.5 : 0.55) / UI_TIME_SCALE;
      setProgress((p) => {
        const next = p + (target - p) * Math.min(1, dt * speed);
        return next > 0.999 && sceneReady ? 1 : next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [sceneReady, reducedMotion]);

  const boot = useBootSequence({ sceneReady, reducedMotion });

  return (
    <>
      <Scene onReady={onReady} />
      <Hud
        phase={boot.phase}
        ready={boot.ready}
        revealed={boot.revealed}
        idle={boot.idle}
        progress={progress}
      />
    </>
  );
}

/** 监听系统的「减少动态」偏好 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export default App;
