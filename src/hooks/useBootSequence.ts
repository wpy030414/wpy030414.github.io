/**
 * useBootSequence.ts — 鹰角式开机引导序列
 *
 * 整个页面的入场是一个有剧本的转场，而非「一次性淡入」。分阶段推进：
 *   0 LOADING  → 黑场 + 中央引导条（等待 3D 就绪，但有硬性最大等待）
 *   1 SCAN     → 扫描线自上而下掠过，HUD 骨架硬切浮现
 *   2 REVEAL   → 标题逐行揭示、面板依次滑入、数据开始滚动
 *   3 IDLE     → 稳定态，所有交互开放
 *
 * 设计原则：
 *  - 相位推进是**纯时间驱动**的，绝不无限期等待 sceneReady。就绪早则提前开演，
 *    就绪晚（软件渲染 / 低端机）由 MAX_LOADING 兜底，绝不让用户干等。
 *  - reducedMotion 是**纯派生值**：偏好开启时直接呈现 IDLE，不在 effect 里 setState。
 */
import { useEffect, useRef, useState } from "react";
import { BOOT } from "../theme/motion";

export type BootPhase = 0 | 1 | 2 | 3;

interface BootOptions {
  /** 3D 场景是否已就绪（首帧渲染完成） */
  sceneReady: boolean;
  /** 尊重减少动态偏好：直接跳到 IDLE */
  reducedMotion: boolean;
}

export function useBootSequence({ sceneReady, reducedMotion }: BootOptions) {
  const [phase, setPhase] = useState<BootPhase>(0);
  const timers = useRef<number[]>([]);
  const launched = useRef(false); // 剧本只启动一次
  const mountedAt = useRef<number | null>(null); // mount 时刻，在 effect 内捕获

  useEffect(() => {
    if (mountedAt.current === null) mountedAt.current = performance.now();

    const clearAll = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };

    // 减少动态偏好由派生值处理，这里不推进剧本
    if (reducedMotion) return clearAll;

    /** 从 delay 起，纯时间驱动地推进 SCAN→REVEAL→IDLE */
    const scheduleAdvance = (delay: number) => {
      timers.current.push(
        window.setTimeout(() => setPhase(1), delay),
        window.setTimeout(() => setPhase(2), delay + BOOT.SCAN),
        window.setTimeout(() => setPhase(3), delay + BOOT.SCAN + BOOT.REVEAL),
      );
    };

    /** 启动剧本（幂等）：补足最短停留后开演 */
    const launch = () => {
      if (launched.current || mountedAt.current === null) return;
      launched.current = true;
      scheduleAdvance(Math.max(0, BOOT.MIN_LOADING - (performance.now() - mountedAt.current)));
    };

    // 就绪 → 提前开演；未就绪 → 最大等待兜底。二者都调 launch（幂等）。
    const since = performance.now() - mountedAt.current;
    const wait = sceneReady
      ? Math.max(0, BOOT.MIN_LOADING - since)
      : Math.max(0, BOOT.MAX_LOADING - since);
    timers.current.push(window.setTimeout(launch, wait));

    return clearAll;
  }, [sceneReady, reducedMotion]);

  // reducedMotion 纯派生：偏好开启直接稳定态，跳过全部引导动画
  const p: BootPhase = reducedMotion ? 3 : phase;

  return {
    phase: p,
    ready: p >= 1, // HUD 骨架浮现
    revealed: p >= 2, // 标题 / 面板揭示
    idle: p >= 3, // 交互开放
    loading: p === 0,
  };
}
