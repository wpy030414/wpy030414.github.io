import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { injectPalette } from "./theme/palette";
import { injectMotion } from "./theme/motion";
import { t } from "./i18n";
import "./index.css";
import "./hud.css";
import App from "./App.tsx";

// 把调色板写入 :root 的 CSS 变量，供 HUD 使用（3D 侧直接 import palette）
injectPalette();
// 把动画速度系数写入 :root 的 --motion，供 CSS calc() 联动
injectMotion();

// 文档标题 / 描述也纳入词条管制（运行时写入，避免在 index.html 里散落硬编码文案）
document.title = t("meta.title");
const desc = document.querySelector('meta[name="description"]');
if (desc) desc.setAttribute("content", t("meta.description"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
