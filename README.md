# XRL DEMONSTRATION — demo.xrl.im

> 创意项目门户首页。对外呈现 XRL 自己的品牌与作品；视觉母题是一片「规则集合体的简谐行波」晶格场，光影语言参照《明日方舟》「莱茵生命 (Rhine Lab)」（内部设计 DNA，不出现在页面上）。

## 这是什么？

- **定位**：`demo.xrl.im` 的门户首页——一个纯前端、无后端的 3D 交互页面，作为创意项目集群的统一入口与品牌门面。
- **解决的核心问题**：用一个有强烈辨识度的视觉语言（鹰角式 HUD + 莱茵生命光影）把访客的注意力锚定住，再把四个真实子项目干净地导向出去；同时把文案、配色、动画速度收敛为可一处修改的单一真相源，便于长期维护。

## 为什么存在？

- **背景 / 动机**：需要一个能承载多个创意子项目的门户。与其做平庸的模板站，不如把首页本身做成一件可交互的视觉作品——一片由 1600 个八面体晶体构成、严格服从 `y = A·sin(ωt+φ)` 的简谐行波晶格场，中央悬浮反应核心，上层覆盖鹰角式 HUD，收束为四个作品入口。视觉基调经对莱茵生命官方物料的一手取色校准（详见 `docs/DECISIONS.md`）。

## 如何安装和运行？

- **前置要求**：Node.js ≥ 24、pnpm ≥ 12.8（仓库通过 `devEngines` 锁定 pnpm 12.8.1）。
- **安装步骤**：`pnpm install`
- **运行 / 启动**：

```bash
pnpm dev       # 开发服务器（vp dev，默认 http://localhost:5173）
pnpm build     # 生产构建（tsc -b && vp build → dist/）
pnpm preview   # 预览生产构建
pnpm lint      # 格式 / lint / 类型检查（vp lint）
```

部署到 GitHub Pages 由 `.github/workflows/deploy.yml` 自动完成（push 到 `main` 触发；自定义域名 `demo.xrl.im` 由仓库根的 `CNAME` 提供）。

## 当前状态

- **阶段**：原型完成（首页可运行、可部署）。typecheck / lint / build 三连绿，视觉经逐帧截图验收。
- **已知限制**：
  - 底部导航四个项目均已接入真实子站，点击**新开标签页**跳转（`target="_blank"`）；子站本身不在本仓库内，需另行部署到对应路径。
  - 依赖 WebGL；软件渲染（如 headless swiftshader）下帧率与计时器会明显变慢，真机 GPU 正常。
  - 3D 资产为纯程序化生成，无外部模型 / 贴图文件。

## 门户收录的四个作品

| 编号 | 项目 | 路径 |
|------|------|------|
| PRJ-01 | 赛博拼豆 (DIGIBOARD) | `/digiboard` |
| PRJ-02 | 车牌生成 (CAR SIGN) | `/car-sign-generator` |
| PRJ-03 | 音乐播放器 (PTEROSAUR) | `/pterosaur` |
| PRJ-04 | 富文本记事 (CLAW CLIP) | `/claw-clip` |

## 核心技术

| 层 | 选型 |
|----|------|
| 工具链 | [Vite+](https://viteplus.dev) 1.0（`vp` CLI：Vite/Rolldown/Vitest/Oxlint/Oxfmt 统一） |
| 框架 | React 19.3 |
| 3D | three.js 0.186 + @react-three/fiber 9.8 + @react-three/drei 10.7 |
| 后处理 | @react-three/postprocessing 3.1（Bloom / CA / Noise / Vignette / ACES / SMAA） |
| 文案 | 自研极简 i18n（`t()` + 类型安全词条表，无运行时依赖，当前不区分语言） |
| 字体 | @fontsource（Oswald + JetBrains Mono，woff2 打进 bundle，**零外链**，国内可访问） |

## 文档索引

| 文档 | 职责 |
|------|------|
| [`AGENTS.md`](./AGENTS.md) | Agent / 协作者快速上手：边界、全局约定、目录速查 |
| [`docs/PRD.md`](./docs/PRD.md) | 产品需求：目标、用户场景、功能及其意义 |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | 系统结构：分层、核心模块、数据流、技术边界 |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md) | 架构决策记录（ADR），含配色取证与品牌分离原则 |
| [`docs/specs/`](./docs/specs/) | 核心模块规格与验收标准 |

> **改这三样，各只需动一个文件**：配色 → `src/theme/palette.ts`；文案 → `src/i18n/messages.ts`；动画速度 → `src/theme/motion.ts`。

## 授权

本项目为个人创意演示。视觉语言致敬《明日方舟》与鹰角网络 (Hypergryph)，与官方无关联；「莱茵生命」及明日方舟相关概念版权归原权利方所有。页面标题的引言 "Here's to the crazy ones…" 出自 1997 年 Apple「Think Different」广告，版权归 Apple Inc.。
