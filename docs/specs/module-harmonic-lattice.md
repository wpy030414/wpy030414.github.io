# Spec — HarmonicLattice（简谐晶格场）

> 对应 `src/scene/HarmonicLattice.tsx`。项目的视觉主角。

## 要构建什么

- **目标**：一片由 N×N 个八面体晶体构成的实例化晶格场，每个晶体严格服从简谐运动（SHM），相位按其在网格中的位置错开，使「单体做简谐运动、群体形成行波」——能量波在晶格上持续推进。以暖矿物光照呈现莱茵生命气质。

## 行为

- 每个实例的竖直位移遵循 `y(t) = A·sin(ωt + φ)`：
  - `φ`（相位）由实例网格坐标决定：`φ = k·dist − dirProj·0.28 + seed·1.7`，其中 `dist` 为到中心距离，`dirProj` 为沿波向的投影，`seed` 为每实例固定随机扰动。
  - 因相位随位置连续变化，群体呈现**行波**；波向 `uWaveDir` 随时间极慢旋转，使行波方向持续演化。
- 每个实例同时有：呼吸缩放（`1 + 0.28·sin(arg)`）、随位移的自旋（`rotY`）。
- 着色：波谷深矿物 → 波峰亮卡其；主光暖白漫射；边缘 fresnel 冷青轮廓光；穿越平衡点（速度最大）时发光；波峰尖点点缀酸黄；纵深雾 + 最外圈边缘淡出。
- 时间基统一为 `elapsedTime × SCENE_SPEED`（见 `theme/motion.ts`）。

## 输入 / 输出

- **输入**（模块级常量 / uniforms）：
  - `GRID = 40`（→ 1600 实例）、`SPACING = 0.94`、`AMPLITUDE = 1.2`、`OMEGA = 1.35`、`WAVE_K = 0.4`。
  - uniforms：`uTime`（每帧更新）、配色组（源自 `palette`）、`uKeyDir/uKeyColor/uRimColor/uFog/uFogDensity/uEdgeFade`。
  - 每实例 attribute：`aGrid`（整数网格坐标）、`aSeed`（PRNG 相位扰动）、`aScale`（中心大、边缘小的缩放）。
- **输出**：一个 `<mesh>`，使用自定义 `shaderMaterial`（顶点着色器算位移/速度，片元着色器算光照），`toneMapped={false}`，`frustumCulled={false}`。

## 约束

- 位移与速度**必须在顶点着色器内计算**（GPU），不得在 CPU 端逐帧遍历 1600 实例。
- 随机相位用 `scene/prng.ts` 的 `mulberry32(0x1a77ce)`，不得用 `Math.random()`。
- 配色一律取自 `palette.ts`，不得内联 hex。
- 时间基必须乘 `SCENE_SPEED`。
- 材质 `toneMapped={false}`（自行管理色彩空间，避免双重 tonemapping，见 ADR-005）。

## 边界条件

- **实例数变化**：改 `GRID` 时，右下角角标（`corner.grid` / `corner.nodes`，经 `content.ts` 的 `field`）须同步，二者数据源不同需人工对齐。
- **边缘淡出**：`uEdgeFade` 控制最外圈淡出半径；若相机轨道半径接近场域半宽（`SPACING × GRID × 0.5 ≈ 18.8`），相机会落入淡出带导致主体变暗——运镜与淡出需协调。
- **过曝风险**：暖色主体 + 多光照项叠加易过曝；波峰应落在不过曝区间以保留晶体棱面（见光照增益的收敛）。
- **软件渲染**：headless swiftshader 下帧率极低，但逻辑不依赖真实帧率（时间基来自 clock）。

## 验收标准

- [x] 1600 个实例做简谐运动，群体形成可见行波（逐帧截图确认波前推进）。
- [x] 晶体离散可读，非糊成一片（间距 / 单体尺寸调校）。
- [x] 暖矿物基调 + 酸黄波峰尖点 + 冷青轮廓光，无饱和度 >40% 大色块。
- [x] 波峰不过曝，保留晶体棱面细节。
- [x] typecheck / lint（零警告）/ build 全绿。
- [x] 时间基乘 `SCENE_SPEED`（grep 审计无遗漏）。

## 完成定义

- 晶格在真机 GPU 下以稳定帧率呈现暖调简谐行波，主角清晰、构图有焦点、明暗对比立体；改 `GRID/SPACING/AMPLITUDE/OMEGA` 等常量可预期地改变形态；所有视觉参数经令牌系统下发，组件内无硬编码。
