/**
 * content.ts — 门户结构数据（非文案）
 *
 * 这里只放「数据」：项目 id、状态、跳转地址、节点规模等。
 * 所有「显示文本」都在 i18n/messages.ts 里，用 t(`project.${id}.xxx`) 取。
 * 这样改文案改词条表，改结构（增删项目 / 换链接）改这里，各司其职。
 */
import type { MessageKey } from "./i18n/messages";

/** 项目 id，同时驱动词条 key（project.<id>.code/name/cn/desc） */
export type ProjectId = "car-sign-generator" | "pterosaur" | "claw-clip" | "digiboard";

/** 状态标签（映射到词条 status.*） */
export type ProjectStatus = "online" | "wip" | "archived" | "sealed";

export interface Project {
  id: ProjectId;
  status: ProjectStatus;
  /** 跳转地址；留空则仅高亮不跳转 */
  href: string;
}

export const projects: Project[] = [
  { id: "digiboard", status: "online", href: "/digiboard" },
  { id: "car-sign-generator", status: "online", href: "/car-sign-generator" },
  { id: "pterosaur", status: "online", href: "/pterosaur" },
  { id: "claw-clip", status: "online", href: "/claw-clip" },
];

/** 由 project id + 字段拼出类型安全的词条 key */
export function projectKey(id: ProjectId, field: "code" | "name" | "cn" | "desc"): MessageKey {
  return `project.${id}.${field}`;
}

/** 晶格规模（右下角角标显示用；与 HarmonicLattice 的 GRID 对应） */
export const field = {
  grid: 40,
  get nodes() {
    return this.grid * this.grid;
  },
};
