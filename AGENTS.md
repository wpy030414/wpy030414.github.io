# AGENTS.md

XRL DEMONSTRATION（`demo.xrl.im`）——一个纯前端 3D 创意项目门户。对外只呈现 XRL 自己的品牌与作品；内部视觉母题是「规则集合体的简谐行波」晶格场，光影语言参照《明日方舟》莱茵生命（属设计 DNA，不出现在页面文案上）。本文件帮助 Agent / 协作者快速定位项目、遵守约定、不破坏既有的单一真相源结构。

## 概述

- **本项目是什么**：React 19 + Vite+ + three.js/r3f 构成的单页 3D 门户首页。主体是一片做简谐行波的实例化晶格场 + 中央反应核心，上层覆盖鹰角式 HUD，收束为四个真实子项目入口。无后端、无路由、无外部数据源，纯静态部署到 GitHub Pages。
- **成熟度**：原型完成，可运行可部署；typecheck / lint / build 全绿。

## 边界与范围

- **范围内**：首页 3D 场景、HUD 平面层、配色 / 文案 / 动画三大令牌系统、构建与部署配置。
- **非目标（明确排除）**：
  - 不做后端、API、数据库、鉴权。
  - 不做多页面路由——目前是单页；底部导航四个项目均为外链，点击**新开标签页**（`target="_blank"`）跳转到同域名下的独立子站（`/digiboard`、`/car-sign-generator`、`/pterosaur`、`/claw-clip`），子站本身不在本仓库。
  - 不引入 i18n 运行时库 / 多语言切换——当前「i18n」仅为文案集中管理（单一 locale），不是国际化功能。
  - 不做移动端专属 3D 降级交互（仅做响应式布局隐藏次要 HUD）。

## Agent 操作指南

### 如何理解本项目

1. 先读 `README.md`（定位）→ 本文件（约定）→ `docs/ARCHITECTURE.md`（结构）→ `docs/DECISIONS.md`（为什么这样做）。
2. **动手前务必理解「三个单一真相源」**——这是本项目最重要的约定，破坏它会让维护成本激增：

| 要改什么 | 只动这个文件 | 机制 |
|----------|-------------|------|
| 配色 | `src/theme/palette.ts` | 3D 直接 import；HUD 经 `injectPalette()` 写入 `:root` 的 `--c-*` |
| 文案 | `src/i18n/messages.ts` | 组件经 `t(key, vars)` 取值，key 类型安全（拼错即编译报错） |
| 动画速度 | `src/theme/motion.ts` | `UI_TIME_SCALE` → CSS `--motion`；`SCENE_SPEED` → 3D 时间基 |

3. 绝不要在组件里硬编码颜色 hex、显示文本、或动画时长 ms——一律走上述令牌。

### 全局规则 / 约定

- **品牌与内部参照分离**：页面**可见文案**只呈现 XRL 自己的品牌（顶栏 `XRL DEMONSTRATION`、主标题 `THINK DIFFERENT`）与作品名，**不得**暴露内部设计参照或实现技术——世界观名词（莱茵生命 / 罗德岛）、视觉母题术语（简谐运动 / SHM 公式）、渲染库名（Three.js / r3f）一律不上页面。这些是内部设计 DNA，只允许出现在代码注释与本 `docs/` 里。改文案时守住这条边界。
- **语言**：文档与注释用简体中文；代码标识符用英文。
- **提交**：Conventional Commits（type/scope 英文，描述中文）。
- **验证**：改动后必须跑 `pnpm exec tsc -b` + `pnpm exec vp lint` + `pnpm run build` 三连绿才算完成。lint 要求**零警告**（React Compiler 对 r3f `useFrame` 命令式改 camera 的误报，用 `/* oxlint-disable react/immutability */` 精准豁免并注释说明）。
- **3D 随机性**：用 `src/scene/prng.ts` 的 `mulberry32(seed)`，不要用 `Math.random()`（React 纯度 + 生成艺术可复现性）。
- **3D 时间基**：任何 `useFrame` 里的时间驱动运动，用 `state.clock.elapsedTime * SCENE_SPEED`，不要直接取 `elapsedTime`。
- **色调映射**：全场景只在后处理链里做一次 ACES；Canvas 的 `gl.toneMapping` 必须是 `NoToneMapping`（否则双重 tonemapping 发灰）。自定义 shader 材质设 `toneMapped={false}`。
- **验收视觉改动**：本项目是视觉作品，改 3D / 光影 / HUD 后应实际渲染截图核对，不能只靠读代码假设效果。
- **快照**：破坏性操作前打 `git tag`；不覆盖、不混入用户既有改动（如仓库根 `CNAME`、历史提交）。

## 目录速查

| 路径 | 职责 |
|------|------|
| `src/theme/palette.ts` | ★ 配色单一真相源 + `injectPalette()` |
| `src/theme/motion.ts` | ★ 动画速度单一真相源 + `injectMotion()` + BOOT/GLITCH 时序 |
| `src/i18n/messages.ts` | ★ 文案单一真相源（词条表，页面全部可见文本） |
| `src/i18n/index.ts` | `t(key, vars)` 类型安全查找 |
| `src/content.ts` | 门户结构数据（项目 id / 状态 / href / 顺序，**非文案**；改序需同步 messages 的 PRJ 编号） |
| `src/scene/` | 3D 场景层（晶格 / 核心 / 微粒 / 灯光 / 运镜 / 后处理） |
| `src/hud/` | 平面 HUD 层（编排 / 叠加 / 标题 / 遥测 / 导航 / 原子件） |
| `src/hooks/useBootSequence.ts` | 开机引导状态机（纯时间驱动，绝不无限等待） |
| `src/App.tsx` | 应用根：Scene + Hud + 引导联动 + 加载进度 |
| `src/main.tsx` | 入口：注入 palette/motion、写入 title/meta、挂载 React |
| `src/index.css` / `src/hud.css` | 全局令牌 / HUD 样式（动画全走 `calc(×var(--motion))`） |
| `.github/workflows/deploy.yml` | GitHub Pages 自动部署 |
| `docs/` | PRD / ARCHITECTURE / DECISIONS / specs |
| `CNAME` | GitHub Pages 自定义域名 `demo.xrl.im`（勿动） |
