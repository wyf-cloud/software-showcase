import { NextResponse } from "next/server";
import { isSoftwareLayout } from "@/lib/software-layout";
import { defaultSiteSettings, getAdminToken, readSiteSettings, type SiteSettings, writeSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const colorPattern = /^#[0-9a-f]{6}$/i;
const urlPattern = /^https?:\/\//i;

function isAuthorized(request: Request) {
  const expected = getAdminToken();
  return Boolean(expected) && request.headers.get("x-admin-token") === expected;
}

function normalizeSettings(input: Partial<SiteSettings>): SiteSettings {
  const current = { ...input } as Record<string, unknown>;
  const stringField = (key: keyof SiteSettings, fallback: string, max = 180) => {
    const value = typeof current[key] === "string" ? current[key] as string : fallback;
    return value.trim().slice(0, max);
  };
  const primaryColor = stringField("primaryColor", defaultSiteSettings.primaryColor, 7);
  const accentColor = stringField("accentColor", defaultSiteSettings.accentColor, 7);
  const githubUrl = stringField("githubUrl", defaultSiteSettings.githubUrl, 240);
  const instagramUrl = stringField("instagramUrl", defaultSiteSettings.instagramUrl, 240);
  if (!colorPattern.test(primaryColor) || !colorPattern.test(accentColor)) throw new Error("颜色必须使用 #RRGGBB 格式");
  if (!urlPattern.test(githubUrl) || !urlPattern.test(instagramUrl)) throw new Error("社交链接必须以 http:// 或 https:// 开头");
  if (current.softwareLayout !== undefined && !isSoftwareLayout(current.softwareLayout)) throw new Error("软件作品展示方式无效，请重新选择");

  return {
    siteName: stringField("siteName", defaultSiteSettings.siteName, 50),
    brandSubtitle: stringField("brandSubtitle", defaultSiteSettings.brandSubtitle, 80),
    siteDescription: stringField("siteDescription", defaultSiteSettings.siteDescription, 240),
    contactEmail: stringField("contactEmail", defaultSiteSettings.contactEmail, 160),
    heroTitle: stringField("heroTitle", defaultSiteSettings.heroTitle, 80),
    heroHighlight: stringField("heroHighlight", defaultSiteSettings.heroHighlight, 80),
    heroDescription: stringField("heroDescription", defaultSiteSettings.heroDescription, 240),
    aboutMetaTitle: stringField("aboutMetaTitle", defaultSiteSettings.aboutMetaTitle, 80),
    aboutTopline: stringField("aboutTopline", defaultSiteSettings.aboutTopline, 80),
    aboutHeroEyebrow: stringField("aboutHeroEyebrow", defaultSiteSettings.aboutHeroEyebrow, 80),
    aboutTitleLead: stringField("aboutTitleLead", defaultSiteSettings.aboutTitleLead, 100),
    aboutTitleHighlight: stringField("aboutTitleHighlight", defaultSiteSettings.aboutTitleHighlight, 100),
    aboutDescription: stringField("aboutDescription", defaultSiteSettings.aboutDescription, 500),
    aboutManifestoEyebrow: stringField("aboutManifestoEyebrow", defaultSiteSettings.aboutManifestoEyebrow, 80),
    aboutManifestoTitleLead: stringField("aboutManifestoTitleLead", defaultSiteSettings.aboutManifestoTitleLead, 100),
    aboutManifestoTitleHighlight: stringField("aboutManifestoTitleHighlight", defaultSiteSettings.aboutManifestoTitleHighlight, 100),
    aboutManifestoDescription: stringField("aboutManifestoDescription", defaultSiteSettings.aboutManifestoDescription, 800),
    aboutValuesEyebrow: stringField("aboutValuesEyebrow", defaultSiteSettings.aboutValuesEyebrow, 80),
    aboutValuesTitle: stringField("aboutValuesTitle", defaultSiteSettings.aboutValuesTitle, 100),
    aboutValueOneTitle: stringField("aboutValueOneTitle", defaultSiteSettings.aboutValueOneTitle, 80),
    aboutValueOneText: stringField("aboutValueOneText", defaultSiteSettings.aboutValueOneText, 300),
    aboutValueTwoTitle: stringField("aboutValueTwoTitle", defaultSiteSettings.aboutValueTwoTitle, 80),
    aboutValueTwoText: stringField("aboutValueTwoText", defaultSiteSettings.aboutValueTwoText, 300),
    aboutValueThreeTitle: stringField("aboutValueThreeTitle", defaultSiteSettings.aboutValueThreeTitle, 80),
    aboutValueThreeText: stringField("aboutValueThreeText", defaultSiteSettings.aboutValueThreeText, 300),
    aboutSignoffEyebrow: stringField("aboutSignoffEyebrow", defaultSiteSettings.aboutSignoffEyebrow, 100),
    aboutSignoffTitleLead: stringField("aboutSignoffTitleLead", defaultSiteSettings.aboutSignoffTitleLead, 100),
    aboutSignoffTitleHighlight: stringField("aboutSignoffTitleHighlight", defaultSiteSettings.aboutSignoffTitleHighlight, 100),
    aboutWorksLinkText: stringField("aboutWorksLinkText", defaultSiteSettings.aboutWorksLinkText, 80),
    aboutEmailLinkText: stringField("aboutEmailLinkText", defaultSiteSettings.aboutEmailLinkText, 80),
    aboutContactButtonText: stringField("aboutContactButtonText", defaultSiteSettings.aboutContactButtonText, 80),
    announcement: stringField("announcement", defaultSiteSettings.announcement, 240),
    primaryColor,
    accentColor,
    defaultTheme: current.defaultTheme === "dark" ? "dark" : defaultSiteSettings.defaultTheme,
    softwareLayout: isSoftwareLayout(current.softwareLayout) ? current.softwareLayout : defaultSiteSettings.softwareLayout,
    showParticles: current.showParticles !== false,
    showDemoNotice: current.showDemoNotice !== false,
    githubUrl,
    instagramUrl,
  };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  return NextResponse.json(await readSiteSettings());
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  try {
    const body = await request.json() as Partial<SiteSettings>;
    const settings = normalizeSettings(body);
    await writeSiteSettings(settings);
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "设置保存失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
