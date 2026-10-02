/**
 * GlitchTitle.tsx — 主标题（鹰角式故障字）
 *
 * 标题逐行揭示：每行从下方硬切滑入 + 一次故障抖动 (glitch)。
 * 故障用两个 data-text 伪元素做 RGB 分离位移，配合 clip-path 抽帧，
 * 只在揭示瞬间和 hover 时触发，平时安静——精密仪器不该一直闪。
 */
import { useEffect, useState } from "react";
import { GLITCH, UI_TIME_SCALE } from "../theme/motion";

export function GlitchTitle({
  lines,
  revealed,
}: {
  lines: string[];
  revealed: boolean;
}) {
  // 周期性地给标题加一次 glitch，制造仪器自检的呼吸感
  const [spike, setSpike] = useState(false);
  useEffect(() => {
    if (!revealed) return;
    let alive = true;
    const fire = () => {
      if (!alive) return;
      setSpike(true);
      window.setTimeout(() => alive && setSpike(false), GLITCH.SPIKE);
      window.setTimeout(fire, GLITCH.INTERVAL_BASE + Math.random() * GLITCH.INTERVAL_JITTER);
    };
    const id = window.setTimeout(fire, GLITCH.FIRST_DELAY);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [revealed]);

  const lineDelay = Math.round(130 * UI_TIME_SCALE);

  return (
    <h1 className={`glitch ${revealed ? "is-revealed" : ""} ${spike ? "is-spiking" : ""}`}>
      {lines.map((line, i) => (
        <span
          key={line}
          className="glitch__line"
          data-text={line}
          style={{ transitionDelay: `${i * lineDelay}ms` }}
        >
          {line}
        </span>
      ))}
    </h1>
  );
}
