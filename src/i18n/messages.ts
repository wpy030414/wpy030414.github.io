/**
 * messages.ts — ★ 全站文案的单一真相源（i18n 词条表）
 *
 * 页面上所有「人可读的显示文本」都集中在这里，用扁平的点分 key 管理。
 * 改文案只需改这一个文件，不必翻组件代码。
 *
 * 约定：
 *  - key 用「区块.用途」的点分命名，便于检索。
 *  - 值里用 `{name}` 占位，配合 t(key, { name }) 插值。
 *  - 纯数字 / 标点 / 单位胶水（如时钟的 ":"）不进词条表——把它们塞进来
 *    反而增加噪音、违背「方便改字符串」的初衷。
 *  - 当前不区分语言：这是唯一一份 catalog。将来要多语言，把它换成
 *    { [locale]: catalog } 再让 t() 按 locale 取值即可，key 不变。
 *
 * 品牌约定：这是「演示项目门户」，页面只呈现 XRL 自己的品牌与作品，
 * 不暴露底层设计参照 / 实现技术（世界观、渲染库、物理公式等一律不上页面）。
 */

export const messages = {
  /* —— 文档 meta（运行时写入 <title> / <meta>）—— */
  "meta.title": "XRL DEMONSTRATION",
  "meta.description":
    "XRL DEMONSTRATION — 创意项目门户",

  /* —— 开机引导幕 —— */
  "boot.label": "initializing imagination",
  "boot.percent": "{v}%",

  /* —— 顶栏 —— */
  "topbar.org": "XRL DEMONSTRATION",
  "topbar.domain": "DEMO.XRL.IM",
  "topbar.version": "v26.10.2",

  /* —— 标题区 —— */
  "title.eyebrow.brand": "PORTAL",
  "title.eyebrow.org": "创意演示集",
  "title.line1": "THINK",
  "title.line2": "DIFFERENT",
  "title.subtitle":
    "Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes.",
  "title.subtitle.attr": "— Steve Jobs, 1997",
  "title.tagline": "FOUR CREATIVE WORKS",

  /* —— 遥测面板 —— */
  "telemetry.title": "TELEMETRY",
  "telemetry.channel": "CH.04",
  "telemetry.utc": "UTC",
  "telemetry.coord": "COORD",
  "telemetry.energy": "ENERGY",
  "telemetry.waveform": "WAVEFORM",
  "telemetry.utc.placeholder": "--:--:--",
  "telemetry.coord.placeholder": "X 0.0 / Z 0.0",
  "telemetry.energy.placeholder": "00.0%",
  "telemetry.coord.value": "X{x} / Z{z}",
  "telemetry.energy.value": "{v}%",

  /* —— 右下角状态角标 —— */
  "corner.field": "NODE FIELD",
  "corner.grid": "{n}×{n}",
  "corner.nodes": "{count} NODES",

  /* —— 项目导航 —— */
  "nav.label": "创意项目导航",
  "status.online": "ONLINE",
  "status.wip": "WIP",
  "status.archived": "ARCHIVED",
  "status.sealed": "SEALED",

  /* —— 项目条目（key 形如 project.<id>.<field>，由 ProjectId 驱动）——
     code 的编号顺序跟随 content.ts 中 projects 的排列，改序需同步两处。 */
  "project.digiboard.code": "PRJ-01",
  "project.digiboard.name": "DIGIBOARD",
  "project.digiboard.cn": "赛博拼豆",
  "project.digiboard.desc": "赛博风格的拼豆像素创作板",

  "project.car-sign-generator.code": "PRJ-02",
  "project.car-sign-generator.name": "CAR SIGN",
  "project.car-sign-generator.cn": "车牌生成",
  "project.car-sign-generator.desc": "生成风格化的车牌图形，可自定义与导出",

  "project.pterosaur.code": "PRJ-03",
  "project.pterosaur.name": "PTEROSAUR",
  "project.pterosaur.cn": "音乐播放器",
  "project.pterosaur.desc": "浏览器里的网页音乐播放器",

  "project.claw-clip.code": "PRJ-04",
  "project.claw-clip.name": "CLAW CLIP",
  "project.claw-clip.cn": "富文本记事",
  "project.claw-clip.desc": "支持富文本排版的轻量记事本",
} as const;

export type MessageKey = keyof typeof messages;
