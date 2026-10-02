/**
 * Lights.tsx — 灯光装置
 *
 * 目标气质（基于一手取证校准）：莱茵生命是「大面积漫射照明」——
 * 6 张场景背景实测 avgSat 仅 12–24%、lum 79–175，说明它是天窗/顶灯柔光箱，
 * 不是硬光聚射。所以：柔光为主 (key/fill) + 唯一硬边轮廓 (rim)。
 *
 * 暖 70% / 冷 30%：暖白 key + 暖黄 fill 打底，冷青 rim 作为唯一的冷声部反调，
 * 呼应 RL 平面标识系统（寄存器 B）的仪器冷边。
 *
 * r3f v9 默认物理光照 (useLegacyLights=false)：
 *  - directionalLight 用 1~2 量级
 *  - pointLight 强度以坎德拉计，用 18~35 量级
 */
import { palette } from "../theme/palette";

export function Lights() {
  return (
    <>
      {/* 暖调低环境光：保住暗部细节但不洗平对比 */}
      <ambientLight intensity={0.2} color="#2a2618" />

      {/* 主光 key：暖白漫射天光，从右上前方塑造体积 */}
      <directionalLight position={[6, 12, 7]} intensity={2.1} color="#fff4dc" />

      {/* 顶光：强化实验室顶灯漫射的均匀感 */}
      <directionalLight position={[0, 18, -4]} intensity={0.55} color="#e8e4d8" />

      {/* 轮廓光 rim：冷青，从后方勾出装置边缘——唯一的冷声部（暖冷并存的 30%） */}
      <directionalLight position={[-9, 5, -11]} intensity={1.5} color={palette.coolant} />

      {/* 暖补 fill：暖黄灯带色，从左下打破单调（原 #ffd23f 过黄过跳） */}
      <pointLight position={[-8, -3, 5]} intensity={26} color={palette.lamp} distance={34} decay={2} />

      {/* 核心辉光：暖白点光，跟随反应核心抬升到 y=3.1，晕染周围晶格 */}
      <pointLight position={[0, 3.4, 0]} intensity={22} color="#ffd98a" distance={20} decay={2} />
    </>
  );
}
