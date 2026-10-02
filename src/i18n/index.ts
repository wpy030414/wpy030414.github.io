/**
 * i18n/index.ts — 极简文案查找
 *
 * t(key)            → 词条文本
 * t(key, vars)      → 带 {占位} 插值的文本
 *
 * 类型安全：key 必须是 messages.ts 里的 MessageKey；插值变量用普通对象。
 * 刻意不做 locale 切换（当前不区分语言）——保持最薄，将来要扩展时
 * 只需在 t() 内部按 locale 选 catalog，key 与调用方都不用动。
 */
import { messages, type MessageKey } from "./messages";

/** 插值变量表：值统一转字符串后替换 {name} 占位 */
export type Vars = Record<string, string | number>;

export function t(key: MessageKey, vars?: Vars): string {
  let text: string = messages[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export { messages, type MessageKey };
