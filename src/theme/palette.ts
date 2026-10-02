/**
 * palette.ts — 全站配色的单一真相源 (single source of truth)
 *
 * 3D 场景 (Three.js) 与 HUD (CSS) 都从这里取色：
 *  - 3D 侧：直接 import { palette }
 *  - HUD 侧：main.tsx 调用 injectPalette() 把这些值写成 :root 上的 CSS 变量
 *
 * 视觉基调（基于一手取证校准，非臆测）：
 * 明日方舟「莱茵生命 (Rhine Lab)」存在两套并行视觉寄存器——
 *   A. 环境/材质/室内：暖橄榄·卡其·米白 + 暖黄灯带（对 6 张游戏内背景 +
 *      4 张官方壁纸 + 5 张干员立绘程序化取色，avgSat 仅 5–24%，全暖无冷）
 *   B. 平面/标识/科技：深蓝黑 #242834 + 冷白电路细线 #e0e0d8（logo/壁纸3）
 *
 * 落地策略：暗场底色取 B（暖近黑微冷），晶格主体取 A（暖矿物卡其），
 * 点睛用明日方舟标志酸黄 #FDF900。冷青降级为轮廓光/仪器边反调（占比 ≤20%）。
 * 硬约束：不出现任何饱和度 >40% 的大面积色块。
 */

export const palette = {
  /* —— 空间与背景（暖近黑，R>G>B；原冷黑方向是反的）—— */
  void: "#0b0a07", // 主背景（暖近黑，取自官方壁纸 #1b1a17 压暗）
  fog: "#14120c", // 雾色
  abyss: "#050504", // 最暗处

  /* —— 莱茵生命暖矿物主色系（寄存器 A）—— */
  mineral: "#b8a878", // 主强调（卡其/矿物，源自控制室 #baaf88）
  mineralHi: "#f5ecd2", // 波峰高亮（米白发光，源自壁纸 #f4f1eb）
  mineralDeep: "#2f3320", // 波谷/阴影——偏橄榄（RL 特征暗橄榄 #2b3120），给暗部一点冷意
  mineralDim: "#221f15", // 未激发态（源自观测台 #1f1c12）

  /* —— 暖黄灯光（RL 室内灯带实测色）—— */
  lamp: "#c9a15a", // 暖黄灯（提亮版）
  lampDeep: "#a29360", // 实测暖黄灯均值（控制室 n=448 采样）

  /* —— 冷调反调（降级保留，仅用于 rim / 仪器边，占比 ≤20%）—— */
  coolant: "#5f8a94", // 去饱和冷青（原 #3fd4c8 饱和度≈70% 超标）
  coolantHi: "#8fb0a6", // 冷青白（rim / 仪器边用）
  coolantDeep: "#24343a", // 深蓝黑（寄存器 B 的暗部）

  /* —— 明日方舟警示暖调 —— */
  warning: "#fdf900", // ★ 标志酸黄（一手查证自 ak.hypergryph.com themeColor）
  warningSoft: "#f4c430", // 正文级黄（暗底可读性更好，对比度 10.2:1）
  ember: "#d96a2a", // 次级暖橙
  alert: "#e0453c", // 警示红（告警态）

  /* —— 中性 / 文字（暖白系）—— */
  paper: "#f4f1e8", // 高亮白（主标题）
  steel: "#a89f8b", // 暖灰（正文/标签）
  graphite: "#6f6856", // 暗暖灰（次要信息）

  /* —— 金属 / 材质基色（磨砂阳极金属，非镜面铬）—— */
  metal: "#8b7b62", // 磨砂金属基色
  metalLight: "#c4bb99", // 亮金属 / 阳极氧化

  /* —— HUD 面板 / 线框 —— */
  panelFill: "rgba(16, 14, 9, 0.62)", // 面板底（暖黑半透）
  panelFillSolid: "rgba(11, 10, 7, 0.86)", // 实面板
  gridLine: "rgba(244, 241, 232, 0.05)", // 背景网格（暖白细线）
  hairline: "rgba(168, 159, 139, 0.22)", // 细分割线
  hairlineHot: "rgba(253, 249, 0, 0.5)", // 高亮分割线（酸黄）
  scanline: "rgba(244, 241, 232, 0.028)", // 扫描线
} as const;

export type Palette = typeof palette;

/** camelCase → kebab-case，用于生成 CSS 变量名 --c-xxx */
function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

/** 把 palette 注入到 :root，供 HUD 的 CSS 通过 var(--c-*) 使用 */
export function injectPalette(root: HTMLElement = document.documentElement): void {
  for (const [k, v] of Object.entries(palette)) {
    root.style.setProperty(`--c-${kebab(k)}`, v);
  }
}
