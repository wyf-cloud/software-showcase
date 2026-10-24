import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { software as defaultSoftware, type Software, type SoftwareVisual } from "@/data/software";

import { softwareBadgeStyleOptions, softwareVisualOptions } from "@/data/software-options";

export { softwareBadgeStyleOptions, softwareVisualOptions };

const visualSet = new Set(softwareVisualOptions.map((item) => item.value));
const badgeStyleSet = new Set(softwareBadgeStyleOptions.map((item) => item.value));
const accentSet = new Set(["mint", "blue", "peach", "lilac", "gold"]);
const softwarePath = path.join(process.cwd(), "data", "software-settings.json");
type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
}

function text(value: unknown, fallback = "", max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}

export function normalizeMediaUrl(value: unknown, fallback = "") {
  const url = text(value, fallback, 500);
  if (!url) return "";
  return url.startsWith("/") && !url.startsWith("//") || /^https?:\/\//i.test(url) ? url : fallback;
}

function visual(value: unknown, fallback: SoftwareVisual): SoftwareVisual {
  return typeof value === "string" && visualSet.has(value as SoftwareVisual) ? value as SoftwareVisual : fallback;
}

function blankItem(slug: string): Software {
  return {
    slug, name: "新建软件", tagline: "为作品写一句简短介绍。", description: "在这里详细介绍这款软件，说明它解决的问题与适用场景。",
    category: "效率工具", version: "1.0.0", updatedAt: new Date().toISOString().slice(0, 10),
    featured: false, priceType: "free", price: "", badgeStyle: "orbit", accent: "mint", visual: "notes", imageUrl: "", storyTitle: "", storyBody: "", screenshots: [],
    demoUrl: "", downloadUrl: "", sourceUrl: "", documentationUrl: "",
  } as Software;
}

function normalizeScreenshots(value: unknown, fallback: Software["screenshots"]): Software["screenshots"] {
  const source = Array.isArray(value) ? value : fallback;
  return source.slice(0, 12).map((item, index) => {
    const row = record(item);
    const defaultRow = fallback[index] || { title: "", caption: "", visual: "notes" as SoftwareVisual };
    return {
      title: text(row.title, defaultRow.title, 100),
      caption: text(row.caption, defaultRow.caption, 240),
      visual: visual(row.visual, defaultRow.visual),
      imageUrl: normalizeMediaUrl(row.imageUrl, defaultRow.imageUrl || "") || undefined,
      linkUrl: normalizeMediaUrl(row.linkUrl, defaultRow.linkUrl || "") || undefined,
    };
  }).filter((item) => item.title || item.caption || item.imageUrl);
}

export function normalizeSoftwareItem(value: unknown, base?: Software): Software {
  const row = record(value);
  const slug = text(row.slug, base?.slug || "", 60).toLowerCase();
  const fallback = base || blankItem(slug);
  return {
    ...fallback,
    slug,
    name: text(row.name, fallback.name, 80),
    tagline: text(row.tagline, fallback.tagline, 140),
    description: text(row.description, fallback.description, 1200),
    category: text(row.category, fallback.category, 60),
    version: text(row.version, fallback.version, 30),
    updatedAt: text(row.updatedAt, fallback.updatedAt, 30),
    featured: row.featured === true,
    priceType: row.priceType === "paid" ? "paid" : "free",
    price: text(row.price, fallback.price || "", 32),
    badgeStyle: typeof row.badgeStyle === "string" && badgeStyleSet.has(row.badgeStyle as Software["badgeStyle"]) ? row.badgeStyle as Software["badgeStyle"] : fallback.badgeStyle,
    accent: typeof row.accent === "string" && accentSet.has(row.accent) ? row.accent : fallback.accent,
    visual: visual(row.visual, fallback.visual),
    imageUrl: normalizeMediaUrl(row.imageUrl, fallback.imageUrl || "") || undefined,
    storyTitle: text(row.storyTitle, fallback.storyTitle || "", 160),
    storyBody: text(row.storyBody, fallback.storyBody || "", 1200),
    screenshots: normalizeScreenshots(row.screenshots, fallback.screenshots),
    demoUrl: normalizeMediaUrl(row.demoUrl, fallback.demoUrl || "") || undefined,
    downloadUrl: normalizeMediaUrl(row.downloadUrl, fallback.downloadUrl || "") || undefined,
    sourceUrl: normalizeMediaUrl(row.sourceUrl, fallback.sourceUrl || "") || undefined,
    documentationUrl: normalizeMediaUrl(row.documentationUrl, fallback.documentationUrl || "") || undefined,
  };
}

export function normalizeSoftwareItems(value: unknown): Software[] {
  if (!Array.isArray(value)) throw new Error("作品列表格式不正确");
  if (value.length > 100) throw new Error("最多可管理 100 个作品模块");
  const defaults = new Map(defaultSoftware.map((item) => [item.slug, item]));
  const seen = new Set<string>();
  return value.map((entry) => {
    const source = record(entry);
    const slug = text(source.slug, "", 60).toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`作品标识“${slug || "空"}”格式不正确，请使用小写英文字母、数字和连字符`);
    if (seen.has(slug)) throw new Error(`作品标识“${slug}”重复了`);
    seen.add(slug);
    const item = normalizeSoftwareItem(source, defaults.get(slug));
    if (!item.name) throw new Error(`请填写“${slug}”的作品名称`);
    return item;
  });
}

export async function readSoftware(): Promise<Software[]> {
  try {
    const raw = await readFile(softwarePath, "utf8");
    return normalizeSoftwareItems(JSON.parse(raw));
  } catch {
    return defaultSoftware;
  }
}

export async function writeSoftware(value: unknown): Promise<Software[]> {
  const items = normalizeSoftwareItems(value);
  const directory = path.dirname(softwarePath);
  await mkdir(directory, { recursive: true });
  const temporaryPath = `${softwarePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  await rename(temporaryPath, softwarePath);
  return items;
}
