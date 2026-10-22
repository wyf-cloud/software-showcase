export type SoftwareVisual = "notes" | "dashboard" | "calendar" | "studio" | "library" | "insights";

export type Software = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  version: string;
  updatedAt: string;
  featured: boolean;
  accent: string;
  visual: SoftwareVisual;
  imageUrl?: string;
  storyTitle?: string;
  storyBody?: string;
  screenshots: { title: string; caption: string; visual: SoftwareVisual; imageUrl?: string; linkUrl?: string }[];
  demoUrl?: string;
  downloadUrl?: string;
  sourceUrl?: string;
  documentationUrl?: string;
};

// 演示条目：用真实作品信息替换此文件中的内容、链接与截图说明。
export const software: Software[] = [
  {
    slug: "mori-notes",
    name: "Mori Notes",
    tagline: "让灵感有处安放。",
    description: "一款轻盈的个人知识整理工具，把随手记录、灵感收集和深度思考放进同一个安静的空间。",
    category: "效率工具",
    version: "1.8.2",
    updatedAt: "2026-09-18",
    featured: true,
    accent: "mint",
    visual: "notes",
    screenshots: [
      { title: "知识空间", caption: "一眼找到正在整理的主题与最近记录。", visual: "notes" },
      { title: "数据导入", caption: "校验字段映射并跟踪批量处理进度。", visual: "library" },
      { title: "规则配置", caption: "设置执行条件并查看应用后的实时结果。", visual: "studio" },
    ],
  },
  {
    slug: "tempo-board",
    name: "Tempo Board",
    tagline: "把每一天，安排得刚刚好。",
    description: "面向独立创作者的轻量项目与时间管理工作台，让计划、进度和成果保持清晰。",
    category: "效率工具",
    version: "2.3.0",
    updatedAt: "2026-08-27",
    featured: true,
    accent: "blue",
    visual: "dashboard",
    screenshots: [
      { title: "项目总览", caption: "工作流、今日任务与进度集中呈现。", visual: "dashboard" },
      { title: "每周计划", caption: "在可执行的节奏里推进重要项目。", visual: "calendar" },
      { title: "数据洞察", caption: "通过轻量统计找到更适合自己的工作方式。", visual: "insights" },
    ],
  },
  {
    slug: "daylight-planner",
    name: "Daylight Planner",
    tagline: "让计划，留一点呼吸感。",
    description: "一款以时间区块为核心的日程规划应用，帮助你在专注工作与自在生活之间找到平衡。",
    category: "生活方式",
    version: "1.2.5",
    updatedAt: "2026-07-11",
    featured: true,
    accent: "peach",
    visual: "calendar",
    screenshots: [
      { title: "今日节奏", caption: "每天的安排清晰可见，也留有余地。", visual: "calendar" },
      { title: "习惯打卡", caption: "温和记录每一次持续，而不是追求完美。", visual: "insights" },
      { title: "专注模式", caption: "暂时收起干扰，把这一段时间留给自己。", visual: "studio" },
    ],
  },
  {
    slug: "still-studio",
    name: "Still Studio",
    tagline: "给创作一个更安静的画布。",
    description: "轻量的视觉素材整理与灵感板工具，为设计探索、情绪板和创意提案提供一个舒服的起点。",
    category: "创意设计",
    version: "0.9.4",
    updatedAt: "2026-06-29",
    featured: true,
    accent: "lilac",
    visual: "studio",
    screenshots: [
      { title: "自由画布", caption: "不同灵感在同一空间里慢慢建立联系。", visual: "studio" },
      { title: "素材收藏", caption: "用简单的方式整理日常遇见的好设计。", visual: "library" },
      { title: "项目灵感", caption: "从参考素材到方向提案，保持创作脉络。", visual: "notes" },
    ],
  },
  {
    slug: "little-ledger",
    name: "Little Ledger",
    tagline: "看清每一笔，也看见生活。",
    description: "更关注消费习惯而非复杂报表的个人记账应用，用温和的可视化帮助你了解金钱流向。",
    category: "生活方式",
    version: "1.6.1",
    updatedAt: "2026-05-16",
    featured: false,
    accent: "gold",
    visual: "insights",
    screenshots: [
      { title: "月度概览", caption: "快速浏览收入、支出与结余。", visual: "insights" },
      { title: "消费分类", caption: "看懂日常支出结构，发现自己的节奏。", visual: "dashboard" },
      { title: "储蓄目标", caption: "把目标放在眼前，持续一点点靠近。", visual: "calendar" },
    ],
  },
  {
    slug: "field-guide",
    name: "Field Guide",
    tagline: "把探索过的路，变成自己的地图。",
    description: "为旅行与城市探索爱好者设计的灵感收藏夹，保存地点、路线和旅途中值得记住的小事。",
    category: "创意设计",
    version: "0.6.0",
    updatedAt: "2026-04-03",
    featured: false,
    accent: "mint",
    visual: "library",
    screenshots: [
      { title: "探索清单", caption: "灵感目的地和私藏地点集中收藏。", visual: "library" },
      { title: "旅程规划", caption: "用简单路线连接每一段值得期待的时光。", visual: "calendar" },
      { title: "旅途手记", caption: "为地点留下自己的故事和小贴士。", visual: "notes" },
    ],
  },
];

export const categories = ["全部作品", ...Array.from(new Set(software.map((item) => item.category)))];
export const featuredSoftware = software.filter((item) => item.featured);
export const getSoftware = (slug: string) => software.find((item) => item.slug === slug);






