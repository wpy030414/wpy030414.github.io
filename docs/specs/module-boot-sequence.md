# Spec — useBootSequence（开机引导状态机）

> 对应 `src/hooks/useBootSequence.ts`。整个页面入场的编排中枢。

## 要构建什么

- **目标**：把页面入场从「一次性淡入」升级为一个有剧本的转场。分四个相位依次推进，驱动 HUD 各区块按节奏揭示；推进过程纯时间驱动，绝不被最慢的渲染路径绑架。

## 行为

- 相位机：`0 LOADING → 1 SCAN → 2 REVEAL → 3 IDLE`。
  - **LOADING**：黑场引导幕 + 中央进度条，等待 3D 就绪。
  - **SCAN**：扫描线自上而下掠过，HUD 骨架硬切浮现（`ready=true`）。
  - **REVEAL**：标题逐行揭示、面板依次滑入、遥测开始滚动（`revealed=true`）。
  - **IDLE**：稳定态，所有交互开放（`idle=true`）。
- 推进由时间驱动：`sceneReady` 到达则提前加速开演；未到达则由 `MAX_LOADING` 硬性兜底强制开演。
- `launch()` 幂等：无论「就绪提前」还是「兜底触发」，剧本只启动一次。
- 补足最短停留：即使 `sceneReady` 极早到达，也至少停留 `MIN_LOADING` 再开演，避免闪现。
- `reducedMotion` 为纯派生：偏好开启时直接返回 IDLE 相位，跳过全部引导动画，不在 effect 内 setState。

## 输入 / 输出

- **输入**：
  - `sceneReady: boolean`（来自 App 的 3D 首帧信号）。
  - `reducedMotion: boolean`（来自系统的 `prefers-reduced-motion`）。
  - 时序常量（来自 `theme/motion.ts` 的 `BOOT`，已乘 `UI_TIME_SCALE`）：`MIN_LOADING≈870`、`MAX_LOADING≈3480`、`SCAN≈1305`、`REVEAL≈1885`（ms，1.45 倍率下）。
- **输出**：`{ phase, ready, revealed, idle, loading }`——`phase` 为当前相位，其余为派生布尔量，供 Hud 绑定 CSS class。

## 约束

- 所有定时器句柄收进 `timers` ref，effect 清理时统一 `clearTimeout`，不得泄漏。
- mount 时刻在 effect 内用 `performance.now()` 捕获（不在 render 期间调用，避免 React 纯度警告）。
- 相位只单调递增，不回退。
- 剧本启动逻辑集中于单一 effect（依赖 `[sceneReady, reducedMotion]`），不散落多处各管一半。

## 边界条件

- **sceneReady 永不到达**（极端低端机 / WebGL 失败）：`MAX_LOADING` 兜底，页面照常揭示，不卡死在黑场。
- **sceneReady 早于 MIN_LOADING 到达**：仍等满 `MIN_LOADING` 再开演，避免引导幕一闪而过。
- **reducedMotion 中途切换**：effect 依赖含 `reducedMotion`，切换会重跑；派生值确保偏好开启即稳定态。
- **StrictMode 双调用**：effect 会挂载两次，`launched` ref 幂等守卫 + 清理函数确保不重复排程、不泄漏。
- **软件渲染计时器拖慢**：swiftshader 下主线程繁忙，setTimeout 会晚触发（截图曾见引导幕停留偏久）；这是环境问题，非逻辑缺陷，真机 GPU 下按预期兜底。

## 验收标准

- [x] 相位严格按 0→1→2→3 单调推进，HUD 各区块按 `ready/revealed/idle` 正确揭示（逐帧截图确认）。
- [x] `sceneReady` 迟到时 `MAX_LOADING` 兜底开演，不无限黑屏。
- [x] `reducedMotion` 下直接 IDLE，无引导动画。
- [x] StrictMode 下不重复排程、无定时器泄漏。
- [x] typecheck / lint（零警告）通过——无 set-state-in-effect、无 render 期 performance.now 警告。

## 完成定义

- 入场是一段可预期、有节奏、不被渲染速度绑架的转场；所有时序经 `motion.ts` 统一调节；减少动态偏好被尊重；状态机在 StrictMode 与异常渲染路径下均健壮。
