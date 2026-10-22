import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { isSoftwareLayout, type SoftwareLayout } from "@/lib/software-layout";

export type SiteSettings = {
  siteName: string;
  brandSubtitle: string;
  siteDescription: string;
  contactEmail: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  aboutMetaTitle: string;
  aboutTopline: string;
  aboutHeroEyebrow: string;
  aboutTitleLead: string;
  aboutTitleHighlight: string;
  aboutDescription: string;
  aboutManifestoEyebrow: string;
  aboutManifestoTitleLead: string;
  aboutManifestoTitleHighlight: string;
  aboutManifestoDescription: string;
  aboutValuesEyebrow: string;
  aboutValuesTitle: string;
  aboutValueOneTitle: string;
  aboutValueOneText: string;
  aboutValueTwoTitle: string;
  aboutValueTwoText: string;
  aboutValueThreeTitle: string;
  aboutValueThreeText: string;
  aboutSignoffEyebrow: string;
  aboutSignoffTitleLead: string;
  aboutSignoffTitleHighlight: string;
  aboutWorksLinkText: string;
  aboutEmailLinkText: string;
  aboutContactButtonText: string;
  announcement: string;
  primaryColor: string;
  accentColor: string;
  defaultTheme: "light" | "dark";
  softwareLayout: SoftwareLayout;
  showParticles: boolean;
  showDemoNotice: boolean;
  githubUrl: string;
  instagramUrl: string;
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "littleworks",
  brandSubtitle: "INDEPENDENT SOFTWARE",
  siteDescription: "为日常创造一点轻盈。探索独立开发的软件作品、效率工具与创意应用。",
  contactEmail: "hello@example.com",
  heroTitle: "把复杂的事，",
  heroHighlight: "做得简单一点。",
  heroDescription: "这里收藏着我做过的每一个小小尝试。认真打磨软件，也认真对待日常。",
  aboutMetaTitle: "关于我",
  aboutTopline: "ABOUT THE STUDIO",
  aboutHeroEyebrow: "A SMALL STUDIO OF ONE",
  aboutTitleLead: "你好，我是一个",
  aboutTitleHighlight: "喜欢把想法做成产品的人。",
  aboutDescription: "littleworks 是我的独立软件工作室。这里记录着我在效率、设计和日常生活方向上的一些探索。",
  aboutManifestoEyebrow: "A FEW BELIEFS",
  aboutManifestoTitleLead: "好软件不是为了",
  aboutManifestoTitleHighlight: "展示功能，而是减少负担。",
  aboutManifestoDescription: "我喜欢把复杂的流程拆开，重新思考每一个步骤：它真的需要存在吗？能不能更清楚一点？能不能让人用完之后，感觉今天轻松了一点？",
  aboutValuesEyebrow: "HOW I LIKE TO WORK",
  aboutValuesTitle: "三个简单的方向",
  aboutValueOneTitle: "保持好奇",
  aboutValueOneText: "从真实的生活和工作里发现值得解决的小问题。",
  aboutValueTwoTitle: "保持克制",
  aboutValueTwoText: "功能和视觉都为体验服务，少一点噪音，多一点重点。",
  aboutValueThreeTitle: "保持真诚",
  aboutValueThreeText: "认真对待每一次使用，也认真听取每一个反馈。",
  aboutSignoffEyebrow: "LET’S MAKE SOMETHING USEFUL",
  aboutSignoffTitleLead: "如果你也在做",
  aboutSignoffTitleHighlight: "一件有意思的事。",
  aboutWorksLinkText: "看看我的作品",
  aboutEmailLinkText: "发送邮件",
  aboutContactButtonText: "来聊聊",
  announcement: "当前作品与链接为演示内容，可在 src/data/software.ts 中替换。",
  primaryColor: "#315f4d",
  accentColor: "#c58b65",
  defaultTheme: "light",
  softwareLayout: "grid",
  showParticles: true,
  showDemoNotice: true,
  githubUrl: "https://github.com",
  instagramUrl: "https://instagram.com",
};

const settingsPath = path.join(process.cwd(), "data", "site-settings.json");

export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const raw = await readFile(settingsPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return {
      ...defaultSiteSettings,
      ...parsed,
      softwareLayout: isSoftwareLayout(parsed.softwareLayout) ? parsed.softwareLayout : defaultSiteSettings.softwareLayout,
    };
  } catch {
    return defaultSiteSettings;
  }
}

export async function writeSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const directory = path.dirname(settingsPath);
  await mkdir(directory, { recursive: true });
  const temporaryPath = `${settingsPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  await rename(temporaryPath, settingsPath);
  return settings;
}

export function getAdminToken(): string {
  return process.env.ADMIN_TOKEN || (process.env.NODE_ENV === "development" ? "local-admin" : "");
}
