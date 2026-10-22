import { type SoftwareVisual } from "@/data/software";

export const softwareVisualOptions: { value: SoftwareVisual; label: string }[] = [
  { value: "notes", label: "工作台界面" },
  { value: "dashboard", label: "数据表格" },
  { value: "calendar", label: "流程向导" },
  { value: "studio", label: "参数编辑" },
  { value: "library", label: "任务队列" },
  { value: "insights", label: "趋势报表" },
];
