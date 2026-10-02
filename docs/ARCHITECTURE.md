# ARCHITECTURE — XRL DEMONSTRATION

## 系统概述

单页纯前端应用，无后端、无路由。运行时由两层视觉 + 三个横切令牌系统构成：

```
┌──────────────────────────────────────────────────────────────┐
│  index.html  →  main.tsx（入口）                                │
│    · injectPalette()  写入 :root 的 --c-*  配色变量              │
│    · injectMotion()   写入 :root 的 --motion 动画系数            │
│    · document.title / <meta> 经 t() 写入                        │
│    · createRoot(<App/>)                                         │
└──────────────────────────────────────────────────────────────┘
                              │
                        ┌─────┴─────┐
                        │  App.tsx  │  引导联动 + 加载进度
                        └─────┬─────┘
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
   ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐
   │  Scene (3D)  │  │    Hud (2D)   │  │ useBootSequence  │
   │  r3f Canvas  │  │  DOM 覆盖层    │  │  引导状态机       │
   │  z-index:0   │  │  z-index:10   │  │  phase 0→1→2→3   │
   └──────┬───────┘  └───────┬───────┘  └────────┬─────────┘
          │                  │                   │ 驱动 ready/
          │                  └───────────────────┘ revealed/idle
          ▼
   晶格场 / 核心 / 微粒 / 灯光 / 运镜 / 后处理
              ▲                  ▲
              │                  │
   ┌──────────┴──────────────────┴───────────────────────────┐
   │  三个单一真相源（横切令牌系统）                             │
   │   theme/palette.ts   theme/motion.ts   i18n/messages.ts  │
   │        配色                动画速度          文案          │
   └──────────────────────────────────────────────────────────┘
```

## 核心模块

| 模块 | 职责 |
|------|------|
| `main.tsx` | 应用入口：注入配色/动画令牌到 `:root`，写入 title/meta，挂载 React |
| `App.tsx` | 根组件：并列渲染 Scene 与 Hud，管理 `sceneReady` 信号与加载进度，桥接引导状态机 |
| `hooks/useBootSequence.ts` | 引导状态机：纯时间驱动地推进 LOADING→SCAN→REVEAL→IDLE，`sceneReady` 只用于提前加速，`MAX_LOADING` 兜底 |
| `scene/Scene.tsx` | 3D 合成：Canvas + 背景/雾 + Environment + 装配所有 3D 子模块；设 `NoToneMapping` 避免双重色调映射 |
| `scene/HarmonicLattice.tsx` | ★ 主角：1600 个实例化八面体，顶点着色器算简谐位移，片元着色器算暖矿物光照 |
| `scene/ReactorCore.tsx` | 中央反应核心：同心环 + 环绕晶体，简谐浮动与自转 |
| `scene/MoteField.tsx` | 悬浮能量微粒：点精灵，竖直简谐浮游 |
| `scene/Lights.tsx` | 灯光装置：暖 key + 冷 rim + 暖黄 fill + 核心辉光 |
| `scene/CameraRig.tsx` | 运镜：轨道漂移 + 鼠标视差 + 阻尼平滑 |
| `scene/Effects.tsx` | 后处理链：Bloom / CA / Noise / Vignette / ACES / SMAA |
| `scene/prng.ts` | 种子化 PRNG（mulberry32），供生成式随机相位 |
| `hud/Hud.tsx` | HUD 编排：顶栏 / 标题区 / 遥测面板 / 项目导航 / 角标 |
| `hud/Overlay.tsx` | 全局叠加：网格 / 扫描线 / 暗角 / 四角框 / 开机引导幕 |
| `hud/GlitchTitle.tsx` | 主标题：逐行揭示 + 偶发 RGB 分离故障 |
| `hud/Telemetry.tsx` | 实时遥测读数 + 简谐示波器（canvas 绘制） |
| `hud/ProjectNav.tsx` | 项目导航：PRJ 编号条目，hover 高亮，新开标签页跳转，文本走 i18n |
| `hud/primitives.tsx` | HUD 原子件：切角面板 / 标签 / 分割线 / 状态点 / 角标 |
| `theme/palette.ts` | ★ 配色单一真相源 + `injectPalette()` |
| `theme/motion.ts` | ★ 动画速度单一真相源 + `injectMotion()` + BOOT/GLITCH 时序常量 |
| `i18n/messages.ts` | ★ 文案单一真相源（扁平点分 key 词条表） |
| `i18n/index.ts` | `t(key, vars)` 类型安全查找 + 占位插值 |
| `content.ts` | 门户结构数据：项目 id / 状态 / href（非文案） |

## 模块关系

- **App 是编排中枢**：并列挂 Scene（背景层）与 Hud（覆盖层），用 `useBootSequence` 的 `phase` 派生出 `ready/revealed/idle` 三个布尔量下发给 Hud，驱动其 CSS 过渡。
- **Scene → 3D 子模块**：Scene 是唯一持有 `<Canvas>` 的地方，所有 3D 子模块作为其子节点；它们共享 Canvas 的相机、渲染器、时钟。
- **令牌系统被全体消费**：palette 被 3D（直接 import）和 HUD（经 CSS 变量）双向消费；motion 被 CSS（`--motion`）和 3D（`SCENE_SPEED`）消费；messages 被所有 HUD 组件消费。这是三层解耦的关键——改令牌即改全站。
- **SceneReady 回环**：Scene 内的 `SceneReady` 组件在首帧回调 App 的 `onReady`，置 `sceneReady=true`，反过来让引导状态机提前结束 LOADING。

## 数据流

1. **启动流**：`main.tsx` 注入令牌 → 挂载 `App` → App 渲染 Scene + Hud（phase=0 LOADING）→ Scene 首帧触发 `onReady` → `sceneReady=true` → 引导状态机提前 launch → phase 依次推进 1/2/3 → Hud 各区块按 phase 揭示。
2. **动画流（每帧）**：r3f 渲染循环 → 各 3D 组件 `useFrame` 取 `elapsedTime * SCENE_SPEED` 作统一时间基 → 更新 uniform（晶格位移/微粒）或直接改 Object3D（核心/相机）→ 后处理链出图。HUD 侧由 rAF 节流（~10fps）更新遥测文本与示波器 canvas。
3. **交互流**：鼠标移动 → r3f `pointer` → CameraRig 视差；hover 项目条目 → ProjectNav 本地 state 切换高亮与描述。
4. **文案流**：组件调 `t(key)` → 从 `messages` 取值（可选 `{占位}` 插值）→ 渲染。title/meta 在 `main.tsx` 一次性写入 DOM。

## 外部系统

- **无运行时外部依赖**：不请求任何外部 API、CDN、字体服务。字体（@fontsource）以 woff2 打进 bundle，零外链——这是为国内访问可靠性刻意选择的。
- **构建期外部系统**：pnpm registry（装依赖）、GitHub Actions（CI/CD 部署到 GitHub Pages）。
- **浏览器能力**：WebGL2（3D 渲染）、Canvas 2D（示波器）、CSS `backdrop-filter`（面板毛玻璃）、`matchMedia`（减少动态偏好）。

## 重要技术边界

- **纯前端 / 静态**：产物是 `dist/` 静态文件，可直接托管；无任何服务端逻辑。
- **色彩空间单一出口**：全场景色调映射只在后处理链做一次 ACES；渲染器侧 `NoToneMapping`，自定义 shader 材质 `toneMapped={false}`。越过此边界（例如给渲染器再开 tonemapping）会导致双重映射发灰。
- **i18n ≠ 国际化**：`t()` 当前只有单一 catalog，无 locale 切换、无复数/日期本地化。它是「文案集中管理」而非「多语言运行时」。扩展多语言需把 catalog 改为按 locale 组织，但 key 与调用方不变。
- **时间基统一约定**：所有 3D 时间驱动运动必须乘 `SCENE_SPEED`；漏乘的组件会脱离整体节奏。
- **无测试套件**：当前验收依赖 typecheck + lint + build + 人工截图核对；尚无 Vitest 单测 / E2E（Vite+ 内置 Vitest，是未来可接入的边界）。
- **响应式边界**：窄屏（≤640px）隐藏遥测面板与角标，只保留标题与导航；3D 场景本身不做移动端专属降级，仅靠 `dpr` 上限控制渲染负载。
