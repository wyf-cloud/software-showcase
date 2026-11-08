import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export const adPlacements = ["announcement", "popup", "home-mid"] as const;
export type AdPlacement = (typeof adPlacements)[number];
export type AdDevice = "all" | "desktop" | "mobile";
export type PopupFrequency = "every-open" | "daily-limit";

export type Advertisement = {
  id: string;
  placement: AdPlacement;
  title: string;
  text: string;
  imageUrl: string;
  href: string;
  buttonText: string;
  enabled: boolean;
  order: number;
  startsAt: string;
  endsAt: string;
  device: AdDevice;
  popupDelaySeconds: number;
  popupFrequency: PopupFrequency;
  popupDailyLimit: number;
};

export type AdvertisementsConfig = { version: 1; ads: Advertisement[] };

export const emptyAdvertisements: AdvertisementsConfig = { version: 1, ads: [] };
const advertisementsPath = path.join(process.cwd(), "data", "advertisements.json");
const allowedKeys = new Set<string>([
  "id", "placement", "title", "text", "imageUrl", "href", "buttonText", "enabled", "order",
  "startsAt", "endsAt", "device", "popupDelaySeconds", "popupFrequency", "popupDailyLimit",
  "popupCooldownHours", // Legacy field accepted for existing configuration files.
]);
const localImagePattern = /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp|avif|gif)$/i;
const idPattern = /^[a-zA-Z0-9_-]{1,64}$/;

function textField(value: unknown, key: string, max: number) {
  if (typeof value !== "string") throw new Error(`${key} 必须是文本`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${key} 不能超过 ${max} 个字符`);
  return trimmed;
}

function optionalDate(value: unknown, key: string) {
  const result = textField(value ?? "", key, 40);
  if (result && !Number.isFinite(Date.parse(result))) throw new Error(`${key} 不是有效日期`);
  return result;
}

function boundedInteger(value: unknown, key: string, min: number, max: number) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error(`${key} 必须是 ${min} 到 ${max} 之间的整数`);
  return number;
}

export function normalizeAdvertisements(input: unknown): AdvertisementsConfig {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("广告配置格式无效");
  const record = input as Record<string, unknown>;
  if (record.version !== 1 || !Array.isArray(record.ads)) throw new Error("广告配置版本或广告列表格式无效");
  if (record.ads.length > 50) throw new Error("最多可配置 50 条广告");

  const seen = new Set<string>();
  const ads = record.ads.map((item, index): Advertisement => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`第 ${index + 1} 条广告格式无效`);
    const row = item as Record<string, unknown>;
    const unknownKey = Object.keys(row).find((key) => !allowedKeys.has(key));
    if (unknownKey) throw new Error(`第 ${index + 1} 条广告包含未知字段：${unknownKey}`);

    const id = textField(row.id, `第 ${index + 1} 条广告 ID`, 64);
    if (!idPattern.test(id) || seen.has(id)) throw new Error(`第 ${index + 1} 条广告 ID 无效或重复`);
    seen.add(id);
    if (!adPlacements.includes(row.placement as AdPlacement)) throw new Error(`第 ${index + 1} 条广告位无效`);
    if (typeof row.enabled !== "boolean") throw new Error(`第 ${index + 1} 条广告启用状态无效`);
    if (!["all", "desktop", "mobile"].includes(String(row.device))) throw new Error(`第 ${index + 1} 条广告展示设备无效`);

    const title = textField(row.title, `第 ${index + 1} 条广告标题`, 100);
    const text = textField(row.text, `第 ${index + 1} 条广告文案`, 500);
    if (row.enabled && (!title || !text)) throw new Error(`启用中的第 ${index + 1} 条广告必须填写标题和文案`);

    const imageUrl = textField(row.imageUrl, `第 ${index + 1} 条广告图片`, 240);
    if (imageUrl && !localImagePattern.test(imageUrl)) throw new Error(`第 ${index + 1} 条广告图片必须来自后台上传素材`);
    const href = textField(row.href, `第 ${index + 1} 条广告链接`, 500);
    const externalHrefIsValid = (() => {
      if (!/^https?:\/\//i.test(href)) return false;
      try {
        const parsed = new URL(href);
        return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
      } catch { return false; }
    })();
    const internalHrefIsValid = href.startsWith("/") && !href.startsWith("//") && !href.includes("\\") && !/[\u0000-\u001f\u007f]/.test(href);
    if (href && !externalHrefIsValid && !internalHrefIsValid) {
      throw new Error(`第 ${index + 1} 条广告链接仅支持有效 http(s) 外链或站内路径`);
    }
    const startsAt = optionalDate(row.startsAt, `第 ${index + 1} 条广告生效时间`);
    const endsAt = optionalDate(row.endsAt, `第 ${index + 1} 条广告结束时间`);
    if (startsAt && endsAt && Date.parse(startsAt) >= Date.parse(endsAt)) throw new Error(`第 ${index + 1} 条广告结束时间必须晚于生效时间`);
    if (typeof row.order !== "number" || !Number.isInteger(row.order)) throw new Error(`第 ${index + 1} 条广告排序值无效`);

    const popupFrequency = row.popupFrequency === undefined ? "daily-limit" : row.popupFrequency;
    if (popupFrequency !== "every-open" && popupFrequency !== "daily-limit") throw new Error(`第 ${index + 1} 条广告弹窗频次无效`);
    const popupDailyLimit = boundedInteger(row.popupDailyLimit === undefined ? 1 : row.popupDailyLimit, `第 ${index + 1} 条广告每天展示次数`, 1, 20);

    return {
      id,
      placement: row.placement as AdPlacement,
      title,
      text,
      imageUrl,
      href,
      buttonText: textField(row.buttonText, `第 ${index + 1} 条广告按钮文字`, 40),
      enabled: row.enabled,
      order: row.order,
      startsAt,
      endsAt,
      device: row.device as AdDevice,
      popupDelaySeconds: boundedInteger(row.popupDelaySeconds, `第 ${index + 1} 条弹窗延迟`, 0, 120),
      popupFrequency,
      popupDailyLimit,
    };
  });

  return { version: 1, ads };
}

export async function readAdvertisements(): Promise<AdvertisementsConfig> {
  try {
    const raw = await readFile(advertisementsPath, "utf8");
    return normalizeAdvertisements(JSON.parse(raw));
  } catch {
    return emptyAdvertisements;
  }
}

export async function writeAdvertisements(config: AdvertisementsConfig): Promise<AdvertisementsConfig> {
  const normalized = normalizeAdvertisements(config);
  const directory = path.dirname(advertisementsPath);
  await mkdir(directory, { recursive: true });
  const temporaryPath = `${advertisementsPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  await rename(temporaryPath, advertisementsPath);
  return normalized;
}

export function isAdvertisementImagePath(value: string): boolean {
  return localImagePattern.test(value);
}

export function getActiveAdvertisements(config: AdvertisementsConfig, placement: AdPlacement, now = Date.now()): Advertisement[] {
  return config.ads
    .filter((ad) => {
      if (!ad.enabled || ad.placement !== placement) return false;
      const startsAt = ad.startsAt ? Date.parse(ad.startsAt) : Number.NEGATIVE_INFINITY;
      const endsAt = ad.endsAt ? Date.parse(ad.endsAt) : Number.POSITIVE_INFINITY;
      return startsAt <= now && now < endsAt;
    })
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
