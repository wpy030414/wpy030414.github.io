/**
 * motion.ts — ★ 全站动画速度的单一真相源
 *
 * 制作人想整体调快 / 调慢动画，只改这里两个系数即可，UI 与 3D 同步生效：
 *
 *  - UI_TIME_SCALE：放大所有 HUD / CSS / 引导时序的「时长」。>1 更慢。
 *    CSS 侧由 main.tsx 把它写成 :root 的 --motion 变量，各时长用
 *    calc(基准 * var(--motion)) 联动；JS 侧（引导、故障闪烁）直接 import。
 *
 *  - SCENE_SPEED：缩放 3D 运动的「频率 / 角速度」。<1 更慢。
 *    晶格简谐 ω、核心自转、相机轨道、微粒浮游、环转速全部乘它。
 *
 * 注意两者语义相反：UI 是「时长 ×scale」（越大越慢），
 * 3D 是「速度 ×scale」（越小越慢）。这样各自读起来都自然。
 */

/** HUD / CSS / 引导动画时长倍率。>1 = 更慢（当前：整体放缓约 45%） */
export const UI_TIME_SCALE = 1.45;

/** 3D 场景运动速度倍率。<1 = 更慢（当前：整体放缓约 28%） */
export const SCENE_SPEED = 0.72;

/** 把 UI_TIME_SCALE 注入 :root 的 --motion，供 CSS calc() 联动 */
export function injectMotion(root: HTMLElement = document.documentElement): void {
  root.style.setProperty("--motion", String(UI_TIME_SCALE));
}

/** 引导序列时序（已乘 UI_TIME_SCALE，单位 ms） */
export const BOOT = {
  /** LOADING 最短停留，避免闪现 */
  MIN_LOADING: Math.round(600 * UI_TIME_SCALE),
  /** LOADING 硬性最大等待，超时也强制开演（软件渲染 / 低端机兜底） */
  MAX_LOADING: Math.round(2400 * UI_TIME_SCALE),
  /** SCAN 阶段时长 */
  SCAN: Math.round(900 * UI_TIME_SCALE),
  /** REVEAL 阶段时长 */
  REVEAL: Math.round(1300 * UI_TIME_SCALE),
} as const;

/** 故障标题时序（已乘 UI_TIME_SCALE，单位 ms） */
export const GLITCH = {
  /** 单次故障闪烁持续 */
  SPIKE: Math.round(200 * UI_TIME_SCALE),
  /** 首次故障延迟 */
  FIRST_DELAY: Math.round(3200 * UI_TIME_SCALE),
  /** 周期故障间隔基准（实际 = base + random*base） */
  INTERVAL_BASE: Math.round(6000 * UI_TIME_SCALE),
  INTERVAL_JITTER: Math.round(5600 * UI_TIME_SCALE),
} as const;
