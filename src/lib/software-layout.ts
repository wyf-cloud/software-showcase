export const softwareLayoutOptions = [
  { value: "grid", label: "经典网格", description: "规整清晰，适合作为日常默认展示。" },
  { value: "stacked", label: "悬浮叠影", description: "错位叠放，悬停时卡片轻盈展开。" },
  { value: "bento", label: "错落拼图", description: "大小卡片组合，呈现 Bento 节奏。" },
  { value: "coverflow", label: "3D 画廊", description: "横向滑动浏览，带透视与景深效果。" },
  { value: "wave", label: "波浪错落", description: "卡片沿曲线起伏，页面更有韵律。" },
  { value: "radial", label: "环形轨道", description: "轨道环绕中心节点，营造作品宇宙。" },
] as const;

export type SoftwareLayout = (typeof softwareLayoutOptions)[number]["value"];

export function isSoftwareLayout(value: unknown): value is SoftwareLayout {
  return softwareLayoutOptions.some((option) => option.value === value);
}
