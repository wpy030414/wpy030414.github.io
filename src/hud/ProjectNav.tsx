/**
 * ProjectNav.tsx — 创意项目导航
 *
 * 底部一列 OP 编号条目，鹰角式高信息密度：编号 / 英文名 / 状态标签，
 * hover 时行内滑出一枚指示条 + 中文副标题，克制但有反馈。
 * 逐条错峰揭示 (stagger)。选中项高亮，有 href 则可点击。
 *
 * 所有显示文本经 i18n 的 t(projectKey(...)) 取自词条表；数据（id/status/href）
 * 来自 content.ts。stagger 延迟随 UI_TIME_SCALE 调慢。
 */
import { useState } from "react";
import { type Project, projectKey } from "../content";
import { t } from "../i18n";
import { UI_TIME_SCALE } from "../theme/motion";
import { StatusDot } from "./primitives";

function statusTone(status: Project["status"]): "coolant" | "warning" | "alert" {
  switch (status) {
    case "online":
      return "coolant";
    case "wip":
      return "warning";
    default:
      return "alert";
  }
}

export function ProjectNav({
  projects,
  revealed,
}: {
  projects: Project[];
  revealed: boolean;
}) {
  const [active, setActive] = useState(0);
  const stagger = Math.round(90 * UI_TIME_SCALE);

  return (
    <nav className={`projnav ${revealed ? "is-revealed" : ""}`} aria-label={t("nav.label")}>
      <ul className="projnav__list">
        {projects.map((p, i) => {
          const isActive = active === i;
          const Inner = (
            <>
              <span className="projnav__idx u-mono-num">{t(projectKey(p.id, "code"))}</span>
              <span className="projnav__name u-caps">{t(projectKey(p.id, "name"))}</span>
              <span className="projnav__cn">{t(projectKey(p.id, "cn"))}</span>
              <span className="projnav__status">
                <StatusDot tone={statusTone(p.status)} />
                <span className="u-caps">{t(`status.${p.status}`)}</span>
              </span>
              <span className="projnav__bar" aria-hidden="true" />
            </>
          );
          return (
            <li
              key={p.id}
              className={`projnav__item ${isActive ? "is-active" : ""}`}
              style={{ transitionDelay: `${i * stagger}ms` }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
            >
              {p.href ? (
                <a
                  className="projnav__link"
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {Inner}
                </a>
              ) : (
                <span className="projnav__link" role="listitem">
                  {Inner}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* 选中项目的描述浮层 */}
      <div className="projnav__detail" aria-live="polite">
        <span className="projnav__detail-code u-mono-num">
          {t(projectKey(projects[active].id, "code"))}
        </span>
        <span className="projnav__detail-desc">{t(projectKey(projects[active].id, "desc"))}</span>
      </div>
    </nav>
  );
}
