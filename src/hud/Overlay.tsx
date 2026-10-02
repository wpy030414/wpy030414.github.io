/**
 * Overlay.tsx — 全局叠加层
 *
 * 铺在整个界面上方的氛围层，包含：
 *  - Grid        坐标网格底纹（极淡，营造测量空间感）
 *  - Scanlines   CRT 扫描线（细密横纹 + 一道缓慢下移的亮带）
 *  - Vignette    CSS 暗角（补足后处理之外的边缘压暗）
 *  - Frame       四角瞄准框 + 边缘刻度（鹰角式仪器边框）
 *  - BootCurtain 开机引导幕：LOADING 阶段的黑场 + 中央引导进度条，
 *                进入 SCAN 时向上硬切拉开，是一次明确的转场。
 *
 * 这一层全部 pointer-events:none，绝不挡交互。
 */
import type { BootPhase } from "../hooks/useBootSequence";
import { t } from "../i18n";

export function Overlay({ phase, progress }: { phase: BootPhase; progress: number }) {
  const loading = phase === 0;
  const scan = phase === 1;
  const pct = Math.round(progress * 100).toString().padStart(3, "0");

  return (
    <>
      {/* 氛围叠加（常驻） */}
      <div className="overlay-grid" aria-hidden="true" />
      <div className="overlay-scanlines" aria-hidden="true" />
      {scan && <div className="overlay-scanbar" aria-hidden="true" />}
      <div className="overlay-vignette" aria-hidden="true" />
      <div className="overlay-frame" aria-hidden="true">
        <span className="frame__corner frame__corner--tl" />
        <span className="frame__corner frame__corner--tr" />
        <span className="frame__corner frame__corner--bl" />
        <span className="frame__corner frame__corner--br" />
        <span className="frame__edge frame__edge--t" />
        <span className="frame__edge frame__edge--b" />
      </div>

      {/* 开机引导幕 */}
      <div className={`boot ${loading ? "is-loading" : "is-open"}`} aria-hidden={!loading}>
        <div className="boot__inner">
          <div className="boot__mark">
            <span className="boot__mark-ring" />
            <span className="boot__mark-core" />
          </div>
          <div className="boot__label u-caps">{t("boot.label")}</div>
          <div className="boot__bar">
            <span className="boot__bar-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <div className="boot__pct u-mono-num">{t("boot.percent", { v: pct })}</div>
        </div>
      </div>
    </>
  );
}
