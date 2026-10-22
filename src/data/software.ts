export type SoftwareVisual = "notes" | "dashboard" | "calendar" | "studio" | "library" | "insights";

export type Software = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  platforms: string[];
  status: string;
  version: string;
  updatedAt: string;
  featured: boolean;
  accent: string;
  visual: SoftwareVisual;
  imageUrl?: string;
  storyTitle?: string;
  storyBody?: string;
  features: { title: string; description: string }[];
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
    tags: ["笔记", "知识管理", "Markdown"],
    platforms: ["Web", "macOS"],
    status: "持续更新",
    version: "1.8.2",
    updatedAt: "2026-09-18",
    featured: true,
    accent: "mint",
    visual: "notes",
    features: [
      { title: "捕捉灵感，不打断思路", description: "快速记录入口始终轻巧，想法先留下来，再慢慢整理成自己的知识。" },
      { title: "让内容自然连接", description: "标签、反向链接与全文搜索协同工作，帮助你重新发现已经写下的内容。" },
      { title: "写作回归专注", description: "舒适的排版、Markdown 支持和简洁界面，让注意力留在文字本身。" },
    ],
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
    tags: ["任务管理", "项目协作", "时间规划"],
    platforms: ["Web", "iOS"],
    status: "正式发布",
    version: "2.3.0",
    updatedAt: "2026-08-27",
    featured: true,
    accent: "blue",
    visual: "dashboard",
    features: [
      { title: "项目状态，一目了然", description: "用清晰的看板视图梳理阶段、优先级和下一步行动。" },
      { title: "留出真正专注的时间", description: "把任务和日程放在一起，减少切换，让重要的事情有完整时间。" },
      { title: "回顾完成的每一步", description: "温和的进度反馈，帮助你看见持续积累的成果。" },
    ],
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
    tags: ["日历", "习惯养成", "专注"],
    platforms: ["Web", "Android"],
    status: "持续更新",
    version: "1.2.5",
    updatedAt: "2026-07-11",
    featured: true,
    accent: "peach",
    visual: "calendar",
    features: [
      { title: "用时间块保护专注", description: "把一天安排成真实可执行的区块，而不是永远写不完的清单。" },
      { title: "习惯融入日常", description: "通过小而稳定的提醒，让重要的生活习惯变得容易坚持。" },
      { title: "计划也可以很松弛", description: "清晰查看空闲时间，为休息和意外留出空间。" },
    ],
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
    tags: ["灵感板", "设计", "素材管理"],
    platforms: ["Web"],
    status: "公开测试",
    version: "0.9.4",
    updatedAt: "2026-06-29",
    featured: true,
    accent: "lilac",
    visual: "studio",
    features: [
      { title: "灵感自由铺开", description: "把图片、文字和颜色放到一张没有边界感的创意画布上。" },
      { title: "素材井然有序", description: "以项目和主题整理收集内容，回看时仍然容易找到。" },
      { title: "轻松分享想法", description: "将早期探索整理成连贯的视觉故事，与伙伴快速同步。" },
    ],
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
    tags: ["记账", "消费分析", "个人财务"],
    platforms: ["iOS", "Android"],
    status: "正式发布",
    version: "1.6.1",
    updatedAt: "2026-05-16",
    featured: false,
    accent: "gold",
    visual: "insights",
    features: [
      { title: "记录足够轻松", description: "用少量操作记下收支，让好习惯不被繁琐流程打断。" },
      { title: "消费结构更直观", description: "通过清晰的分类和趋势，了解自己的生活支出。" },
      { title: "目标进度看得见", description: "把长期目标拆成可以持续追踪的小步骤。" },
    ],
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
    tags: ["旅行规划", "地图收藏", "灵感"],
    platforms: ["Web", "iOS"],
    status: "概念展示",
    version: "0.6.0",
    updatedAt: "2026-04-03",
    featured: false,
    accent: "mint",
    visual: "library",
    features: [
      { title: "收下沿途的好去处", description: "把朋友推荐和偶然发现的地点放入自己的探索清单。" },
      { title: "让路线更有故事", description: "把地点、笔记和照片串在一起，留下旅程的脉络。" },
      { title: "分享私藏地图", description: "整理一份轻松易读的城市指南，与朋友共享灵感。" },
    ],
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






