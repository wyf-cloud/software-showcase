import type { SoftwareBadgeStyle, SoftwareVisual } from "@/data/software";

export const softwareVisualOptions: { value: SoftwareVisual; label: string }[] = [
  { value: "notes", label: "工作台界面" },
  { value: "dashboard", label: "数据表格" },
  { value: "calendar", label: "流程向导" },
  { value: "studio", label: "参数编辑" },
  { value: "library", label: "任务队列" },
  { value: "insights", label: "趋势报表" },
];

export const softwareBadgeStyleOptions: { value: SoftwareBadgeStyle; label: string; description: string }[] = [
  { value: "orbit", label: "环轨流光", description: "双层光轨缓缓环绕" },
  { value: "sheen", label: "丝绸掠光", description: "柔和高光从表面滑过" },
  { value: "pulse", label: "脉冲光环", description: "细腻呼吸光晕" },
  { value: "glass", label: "冰晶玻璃", description: "通透磨砂与折射边缘" },
  { value: "enamel", label: "珐琅徽章", description: "金属描边与徽章质感" },
  { value: "prism", label: "极光棱镜", description: "渐变色谱缓慢流转" },
];
