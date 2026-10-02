/**
 * primitives.tsx — 鹰角式 HUD 原子组件
 *
 * 这些是构成整套界面的最小零件，全部遵循硬朗直角 / 切角 / 等宽数据的语言：
 *  - CutPanel  切角面板（用 clip-path 削掉一角，鹰角标志性轮廓）
 *  - Tag       编号 / 状态标签
 *  - Hairline  细分割线（可带端点刻度）
 *  - StatusDot 状态指示点（呼吸）
 *  - CornerTicks 四角刻度标记（瞄准框感）
 */
import type { CSSProperties, ReactNode } from "react";

/* —— 切角面板：clip-path 削角，可选描边 —— */
export function CutPanel({
  children,
  className = "",
  style,
  cut = 14,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  cut?: number;
}) {
  const clip = `polygon(0 0, calc(100% - ${cut}px) 0, 100% ${cut}px, 100% 100%, ${cut}px 100%, 0 calc(100% - ${cut}px))`;
  return (
    <div className={`cut ${className}`} style={{ ...style, clipPath: clip }}>
      {children}
    </div>
  );
}

/* —— 标签：全大写、高字距、等宽 —— */
export function Tag({
  children,
  tone = "steel",
  className = "",
}: {
  children: ReactNode;
  tone?: "steel" | "coolant" | "warning" | "alert" | "paper";
  className?: string;
}) {
  return <span className={`tag tag--${tone} ${className}`}>{children}</span>;
}

/* —— 细分割线，可选左端刻度块 —— */
export function Hairline({
  className = "",
  tick = true,
}: {
  className?: string;
  tick?: boolean;
}) {
  return (
    <div className={`hairline ${className}`}>
      {tick && <span className="hairline__tick" />}
    </div>
  );
}

/* —— 呼吸状态点 —— */
export function StatusDot({
  tone = "coolant",
  className = "",
}: {
  tone?: "coolant" | "warning" | "alert";
  className?: string;
}) {
  return <span className={`dot dot--${tone} ${className}`} aria-hidden="true" />;
}

/* —— 四角刻度（瞄准框）—— */
export function CornerTicks({ className = "" }: { className?: string }) {
  return (
    <span className={`corners ${className}`} aria-hidden="true">
      <i className="corners__c corners__c--tl" />
      <i className="corners__c corners__c--tr" />
      <i className="corners__c corners__c--bl" />
      <i className="corners__c corners__c--br" />
    </span>
  );
}
