/**
 * Hud.tsx — HUD 编排层
 *
 * 把顶栏、主标题、侧栏遥测、底部项目导航、全局叠加组装成完整的鹰角式界面。
 * 所有区块的揭示由 useBootSequence 的阶段驱动，形成一次有剧本的入场转场。
 *
 * 布局用固定的四角定位（top bar / 左标题 / 右遥测 / 底导航），
 * 中央完全留给 3D 场景，符合「界面是仪器的取景框」这一意象。
 *
 * 所有显示文本经 i18n 的 t() 取自词条表（src/i18n/messages.ts）。
 */
import type { BootPhase } from "../hooks/useBootSequence";
import { projects, field } from "../content";
import { t } from "../i18n";
import { GlitchTitle } from "./GlitchTitle";
import { Telemetry } from "./Telemetry";
import { ProjectNav } from "./ProjectNav";
import { Overlay } from "./Overlay";
import { CutPanel, Tag, Hairline, CornerTicks } from "./primitives";

interface HudProps {
  phase: BootPhase;
  ready: boolean;
  revealed: boolean;
  idle: boolean;
  progress: number;
}

export function Hud({ phase, ready, revealed, idle, progress }: HudProps) {
  return (
    <div className={`hud ${ready ? "is-ready" : ""} ${idle ? "is-idle" : ""}`}>
      <Overlay phase={phase} progress={progress} />

      {/* —— 顶栏 —— */}
      <header className={`topbar ${ready ? "is-in" : ""}`}>
        <div className="topbar__left">
          <span className="brandmark" aria-hidden="true">
            <span className="brandmark__rhombus" />
          </span>
          <span className="topbar__org u-caps">{t("topbar.org")}</span>
        </div>
        <div className="topbar__right">
          <Tag tone="coolant">{t("topbar.domain")}</Tag>
          <span className="topbar__sep" />
          <Tag tone="steel">{t("topbar.version")}</Tag>
        </div>
      </header>

      {/* —— 左上：主标题区 —— */}
      <div className={`titleblock ${ready ? "is-in" : ""}`}>
        <div className="titleblock__eyebrow">
          <Tag tone="warning">
            <span className="u-mono-num">{t("title.eyebrow.brand")}</span> ·{" "}
            {t("title.eyebrow.org")}
          </Tag>
          <Hairline className="titleblock__rule" tick />
        </div>
        <GlitchTitle lines={[t("title.line1"), t("title.line2")]} revealed={revealed} />
        <p className={`titleblock__sub ${revealed ? "is-in" : ""}`}>{t("title.subtitle")}</p>
        <p className={`titleblock__attr ${revealed ? "is-in" : ""}`}>
          {t("title.subtitle.attr")}
        </p>
        <p className={`titleblock__tagline u-caps ${revealed ? "is-in" : ""}`}>
          {t("title.tagline")}
        </p>
      </div>

      {/* —— 右侧：遥测面板 —— */}
      <aside className={`sidepanel ${ready ? "is-in" : ""}`}>
        <CutPanel cut={12}>
          <CornerTicks />
          <div className="sidepanel__head">
            <Tag tone="coolant">{t("telemetry.title")}</Tag>
            <span className="sidepanel__hint u-mono-num">{t("telemetry.channel")}</span>
          </div>
          <Hairline tick={false} />
          <Telemetry active={revealed} />
        </CutPanel>
      </aside>

      {/* —— 底部：项目导航 —— */}
      <footer className={`bottombar ${ready ? "is-in" : ""}`}>
        <ProjectNav projects={projects} revealed={revealed} />
      </footer>

      {/* —— 右下角状态角标 —— */}
      <div className={`cornermeta ${ready ? "is-in" : ""}`}>
        <span className="u-caps">{t("corner.field")}</span>
        <span className="cornermeta__val u-mono-num">{t("corner.grid", { n: field.grid })}</span>
        <span className="cornermeta__val u-mono-num">
          {t("corner.nodes", { count: field.nodes })}
        </span>
      </div>
    </div>
  );
}
