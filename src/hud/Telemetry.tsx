/**
 * Telemetry.tsx — 实时遥测读数
 *
 * 鹰角 HUD 的灵魂是「仪器感」：不断跳动的等宽数字。这里用 rAF 驱动一组
 * 读数——UTC 时钟、坐标、能量百分比，以及一个把「简谐运动」画出来的
 * 迷你示波器 (oscilloscope)，让平面层与 3D 晶格的物理法则在视觉上呼应。
 *
 * 为控制开销，遥测以 ~10fps 节流更新 DOM，示波器单独用 canvas 画。
 */
import { useEffect, useRef } from "react";
import { t } from "../i18n";
import { SCENE_SPEED } from "../theme/motion";

/** 迷你示波器：绘制 y = A·sin(ωt+φ) 的滚动波形 */
function Oscilloscope() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = (cv.width = cv.offsetWidth * dpr);
    const H = (cv.height = cv.offsetHeight * dpr);
    ctx.scale(dpr, dpr);
    const w = W / dpr;
    const h = H / dpr;

    const css = getComputedStyle(document.documentElement);
    const stroke = css.getPropertyValue("--c-mineral").trim() || "#b8a878";
    const hot = css.getPropertyValue("--c-mineral-hi").trim() || "#f5ecd2";

    let raf = 0;
    const OMEGA = 1.35 * SCENE_SPEED; // 与晶格同源，随场景速度调慢
    const draw = () => {
      const now = performance.now() / 1000;
      ctx.clearRect(0, 0, w, h);

      // 中线
      ctx.strokeStyle = "rgba(139,162,184,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // 波形：相位沿 x 展开 → 行波
      const amp = h * 0.34;
      ctx.lineWidth = 1.4;
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, stroke);
      grad.addColorStop(1, hot);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 1) {
        const phase = (x / w) * Math.PI * 4;
        const y = h / 2 - Math.sin(OMEGA * now * 1.6 + phase) * amp * (0.4 + 0.6 * (x / w));
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // 波前亮点
      const yf = h / 2 - Math.sin(OMEGA * now * 1.6 + Math.PI * 4) * amp;
      ctx.fillStyle = hot;
      ctx.beginPath();
      ctx.arc(w - 1, yf, 2, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="osc" aria-hidden="true" />;
}

/** 节流更新的文本遥测 */
export function Telemetry({ active }: { active: boolean }) {
  const clockRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const energyRef = useRef<HTMLSpanElement>(null);
  const energyBarRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = 0;
    const OMEGA = 1.35 * SCENE_SPEED;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 100) return; // ~10fps 节流
      last = now;
      const tsec = (now / 1000) * SCENE_SPEED; // 随场景速度调慢

      if (clockRef.current) {
        // UTC 是真实时间，不随动画速度变化
        const d = new Date();
        const p = (n: number) => String(n).padStart(2, "0");
        clockRef.current.textContent = `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
      }
      if (coordRef.current) {
        const x = (Math.sin(tsec * 0.2) * 128).toFixed(1).padStart(6, " ");
        const z = (Math.cos(tsec * 0.16) * 128).toFixed(1).padStart(6, " ");
        coordRef.current.textContent = t("telemetry.coord.value", { x, z });
      }
      if (energyRef.current && energyBarRef.current) {
        // 能量 = |cos| 归一化，呼应简谐速度
        const e = Math.abs(Math.cos(OMEGA * (now / 1000)));
        energyRef.current.textContent = t("telemetry.energy.value", {
          v: (e * 100).toFixed(1).padStart(5, " "),
        });
        energyBarRef.current.style.transform = `scaleX(${e.toFixed(3)})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <div className="telemetry">
      <div className="telemetry__row">
        <span className="telemetry__label">{t("telemetry.utc")}</span>
        <span ref={clockRef} className="telemetry__value u-mono-num">
          {t("telemetry.utc.placeholder")}
        </span>
      </div>
      <div className="telemetry__row">
        <span className="telemetry__label">{t("telemetry.coord")}</span>
        <span ref={coordRef} className="telemetry__value u-mono-num">
          {t("telemetry.coord.placeholder")}
        </span>
      </div>
      <div className="telemetry__row telemetry__row--energy">
        <span className="telemetry__label">{t("telemetry.energy")}</span>
        <span ref={energyRef} className="telemetry__value u-mono-num">
          {t("telemetry.energy.placeholder")}
        </span>
      </div>
      <div className="bar">
        <span ref={energyBarRef} className="bar__fill" />
      </div>
      <div className="telemetry__osc">
        <span className="telemetry__label">{t("telemetry.waveform")}</span>
        <Oscilloscope />
      </div>
    </div>
  );
}
