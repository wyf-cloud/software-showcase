"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Software, SoftwareBadgeStyle, SoftwarePriceType, SoftwareVisual } from "@/data/software";
import { softwareBadgeStyleOptions, softwareVisualOptions } from "@/data/software-options";
import { SoftwarePricingBadge } from "@/components/software-pricing-badge";

type EditorStatus = { type: "success" | "error" | "info"; message: string } | null;
type ValidationIssue = { itemIndex: number; fieldId: string; message: string };
const validationFieldId = (itemIndex: number, key: string) => "software-field-" + itemIndex + "-" + key.replaceAll(".", "-");
function isValidMediaUrl(value?: string) {
  const url = value?.trim();
  if (!url) return true;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try { const parsed = new URL(url); return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname); }
  catch { return false; }
}
function validateSoftwareItems(items: Software[]) {
  const errors: Record<string, string> = {}; let first: ValidationIssue | undefined;
  const add = (itemIndex: number, key: string, message: string) => { const fieldId = key === "list" ? "software-list-error" : validationFieldId(itemIndex, key); errors[fieldId] = message; first ||= { itemIndex, fieldId, message }; };
  const checkLength = (i: number, key: string, label: string, value: string | undefined, limit: number) => { if ((value || "").length > limit) add(i, key, label + "最多填写 " + limit + " 个字符；请精简内容后重试。"); };
  const checkUrl = (i: number, key: string, label: string, value?: string) => { if (!isValidMediaUrl(value)) add(i, key, label + "格式不正确；示例：https://example.com 或 /uploads/demo.png"); checkLength(i, key, label, value, 500); };
  if (items.length > 100) add(0, "list", "最多可管理 100 个作品模块；请移除多余项目后重试。");
  const seen = new Set<string>();
  items.forEach((item, i) => {
    const slug = item.slug.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) add(i, "slug", "只允许小写英文字母、数字和连字符；例如：mori-notes");
    else if (seen.has(slug)) add(i, "slug", "这个作品标识已被其他作品使用；例如：mori-notes-2");
    seen.add(slug);
    if (!item.name.trim()) add(i, "name", "请填写作品名称；例如：Mori Notes");
    if (item.priceType !== "free" && item.priceType !== "paid") add(i, "priceType", "请选择免费或付费状态。");
    if (item.priceType === "paid" && (item.price || "").length > 32) add(i, "price", "价格说明最多填写 32 个字符。");
    if (!softwareBadgeStyleOptions.some((option) => option.value === item.badgeStyle)) add(i, "badgeStyle", "徽标风格无效；请选择六种样式之一。");
    checkLength(i, "slug", "详情页地址标识", item.slug, 60);
    checkLength(i, "name", "作品名称", item.name, 80);
    checkLength(i, "tagline", "一句话副标题", item.tagline, 140);
    checkLength(i, "category", "分类", item.category, 60);
    checkLength(i, "description", "详细介绍", item.description, 1200);
    checkLength(i, "storyTitle", "详情故事标题", item.storyTitle, 160);
    checkLength(i, "storyBody", "详情故事正文", item.storyBody, 1200);
    checkLength(i, "version", "版本号", item.version, 30);
    if (item.updatedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(item.updatedAt) || Number.isNaN(Date.parse(item.updatedAt)) || new Date(item.updatedAt + "T00:00:00Z").toISOString().slice(0, 10) !== item.updatedAt)) add(i, "updatedAt", "日期格式不正确；请选择有效日期，例如：2026-10-22");
    if (!["notes", "dashboard", "calendar", "studio", "library", "insights"].includes(item.visual)) add(i, "visual", "界面示意类型无效；请选择列表中的一种样式。");
    if (!["mint", "blue", "peach", "lilac", "gold"].includes(item.accent)) add(i, "accent", "卡片配色无效；请选择列表中的一种配色。");
    checkUrl(i, "imageUrl", "封面图片地址", item.imageUrl); checkUrl(i, "demoUrl", "演示视频链接", item.demoUrl); checkUrl(i, "downloadUrl", "下载链接", item.downloadUrl); checkUrl(i, "sourceUrl", "源代码链接", item.sourceUrl); checkUrl(i, "documentationUrl", "文档链接", item.documentationUrl);
    if (item.screenshots.length > 12) add(i, "screenshots", "展示模块最多 12 项；请移除多余项后重试。");
    item.screenshots.forEach((row, index) => { checkLength(i, "screenshots." + index + ".title", "模块标题", row.title, 100); checkLength(i, "screenshots." + index + ".caption", "模块说明", row.caption, 240); checkUrl(i, "screenshots." + index + ".imageUrl", "展示图片地址", row.imageUrl); checkUrl(i, "screenshots." + index + ".linkUrl", "模块跳转链接", row.linkUrl); });
  });
  return { errors, first };
}

const blankSoftware = (slug: string): Software => ({
  slug,
  name: "新建软件",
  tagline: "为作品写一句简短介绍。",
  description: "详细介绍这款软件，说明它解决的问题、适用场景和设计理念。",
  category: "效率工具",
  version: "1.0.0",
  updatedAt: new Date().toISOString().slice(0, 10),
  featured: false,
  priceType: "free",
  price: "",
  badgeStyle: "orbit",
  accent: "mint",
  visual: "notes",
  imageUrl: "",
  storyTitle: "",
  storyBody: "",
  screenshots: [{ title: "", caption: "", visual: "notes", imageUrl: "", linkUrl: "" }],
});

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return <div className={"admin-field " + (error ? "is-invalid" : "")}><label className="admin-field-label" htmlFor={id}>{label}</label>{children}{hint && <span className="admin-field-hint">{hint}</span>}{error && <span className="admin-field-error" id={id + "-error"}>{error}</span>}</div>;
}

function ImageControl({ id, label, value, busy, error, onChange, onUpload }: { id: string; label: string; value?: string; busy: boolean; error?: string; onChange: (value: string) => void; onUpload: (file: File) => void }) {
  return (
    <div className="software-image-control">
      <Field id={id} label={label} error={error} hint="可粘贴图片网址，或上传 JPG / PNG / WebP / AVIF / GIF（最大 8MB）">
        <div className="software-image-input"><input id={id} data-validation-id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? id + "-error" : undefined} type="text" inputMode="url" value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder="https://… 或 /uploads/…" /><label className={"button button-outline software-upload-button " + (busy ? "is-uploading" : "")}><input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /><Upload size={14} />{busy ? "上传中…" : "上传图片"}</label></div>
      </Field>
      {value && <div className="software-admin-image-preview"><Image src={value} alt={label + "预览"} fill unoptimized sizes="320px" /></div>}
    </div>
  );
}

export function SoftwareManager({ token }: { token: string }) {
  const [items, setItems] = useState<Software[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [status, setStatus] = useState<EditorStatus>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [focusTarget, setFocusTarget] = useState<{ itemIndex: number; fieldId: string; nonce: number } | null>(null);
  const selected = items[selectedIndex];

  useEffect(() => {
    if (!focusTarget || focusTarget.itemIndex !== selectedIndex) return;
    const frame = window.requestAnimationFrame(() => {
      const control = document.getElementById(focusTarget.fieldId);
      control?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (control instanceof HTMLElement) control.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusTarget, selectedIndex]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/admin/software", { headers: { "x-admin-token": token }, cache: "no-store" });
        const data = await response.json() as Software[] | { error?: string };
        if (!response.ok || !Array.isArray(data)) throw new Error((data as { error?: string }).error || "作品列表读取失败");
        if (!active) return;
        setItems(data);
        setSelectedIndex((index) => Math.min(index, Math.max(data.length - 1, 0)));
        setStatus(null);
      } catch (error) {
        if (active) setStatus({ type: "error", message: error instanceof Error ? error.message : "作品列表读取失败" });
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [token]);

  function updateSelected(change: Partial<Software>) {
    const nextItems = items.map((item, index) => index === selectedIndex ? { ...item, ...change } : item);
    setItems(nextItems);
    setFieldErrors(validateSoftwareItems(nextItems).errors);
    setStatus(null);
  }

  function addItem() {
    const base = `my-software-${Date.now().toString().slice(-6)}`;
    let slug = base;
    let suffix = 2;
    while (items.some((item) => item.slug === slug)) slug = `${base}-${suffix++}`;
    const nextItems = [...items, blankSoftware(slug)];
    setItems(nextItems);
    setFieldErrors(validateSoftwareItems(nextItems).errors);
    setSelectedIndex(items.length);
    setStatus({ type: "info", message: "已添加新作品模块，填写内容后点击保存作品。" });
  }

  function removeSelected() {
    if (!selected || !window.confirm(`确定删除「${selected.name}」这个作品模块吗？`)) return;
    const nextItems = items.filter((_, index) => index !== selectedIndex);
    setItems(nextItems);
    setFieldErrors(validateSoftwareItems(nextItems).errors);
    setSelectedIndex((index) => Math.max(0, index - 1));
    setStatus({ type: "info", message: "模块已从编辑列表移除，请保存作品使删除生效。" });
  }

  function moveItem(direction: -1 | 1) {
    const target = selectedIndex + direction;
    if (target < 0 || target >= items.length) return;
    const nextItems = [...items];
    [nextItems[selectedIndex], nextItems[target]] = [nextItems[target], nextItems[selectedIndex]];
    setItems(nextItems);
    setFieldErrors(validateSoftwareItems(nextItems).errors);
    setSelectedIndex(target);
    setStatus(null);
  }

  async function upload(file: File, key: string, apply: (url: string) => void) {
    setUploading(key);
    setStatus(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-token": token }, body });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "图片上传失败");
      apply(data.url);
      setStatus({ type: "success", message: "图片已上传，保存作品后将在前台展示。" });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "图片上传失败" });
    } finally {
      setUploading("");
    }
  }

  async function saveItems() {
    const validation = validateSoftwareItems(items);
    setFieldErrors(validation.errors);
    if (validation.first) {
      setSelectedIndex(validation.first.itemIndex);
      setFocusTarget({ ...validation.first, nonce: Date.now() });
      const itemName = items[validation.first.itemIndex]?.name || "作品列表";
      setStatus({ type: "error", message: "保存前发现填写问题（" + itemName + "）：" + validation.first.message });
      return;
    }
    setFocusTarget(null);
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/software", { method: "PUT", headers: { "content-type": "application/json", "x-admin-token": token }, body: JSON.stringify(items) });
      const data = await response.json() as Software[] | { error?: string };
      if (!response.ok || !Array.isArray(data)) throw new Error((data as { error?: string }).error || "作品保存失败");
      setItems(data);
      setSelectedIndex((index) => Math.min(index, Math.max(data.length - 1, 0)));
      setFieldErrors({});
      setStatus({ type: "success", message: "作品模块已保存，前台卡片与详情页已同步更新。" });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "作品保存失败" });
    } finally {
      setSaving(false);
    }
  }

  const fieldId = (key: string) => validationFieldId(selectedIndex, key);
  const fieldError = (key: string) => fieldErrors[fieldId(key)];
  const itemHasErrors = (index: number) => Object.keys(fieldErrors).some((id) => id.startsWith("software-field-" + index + "-"));
  const inputProps = (key: string) => {
    const id = fieldId(key); const error = fieldErrors[id];
    return { id, "data-validation-id": id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? id + "-error" : undefined };
  };

  return (
    <section className="admin-card software-manager" aria-label="软件作品模块管理">
      <div className="admin-card-heading software-manager-heading">
        <span className="admin-card-index">04</span>
        <div><span className="eyebrow">PORTFOLIO CONTENT</span><h2>软件作品模块</h2><p>统一编辑列表卡片、详情内容、图片与外部链接。</p></div>
        <div className="software-manager-actions">
          <button type="button" className="button button-outline" onClick={addItem}><Plus size={15} /> 新建作品</button>
          <button type="button" className="button button-dark" onClick={() => void saveItems()} disabled={saving || loading}><Save size={15} />{saving ? "保存中…" : "保存作品"}</button>
        </div>
      </div>
      {status && <div className={"admin-status admin-status-" + status.type} role={status.type === "error" ? "alert" : "status"}><span className="admin-status-symbol">{status.type === "error" ? "!" : status.type === "success" ? "✓" : "i"}</span>{status.message}</div>}
      {loading ? <div className="software-manager-loading">正在读取作品模块…</div> : <div className="software-manager-layout">
        <aside className="software-manager-list" id="software-list" tabIndex={-1}>
          <div className="software-manager-list-title"><span>作品列表</span><b>{String(items.length).padStart(2, "0")}</b></div>
          {fieldErrors["software-list-error"] && <div className="admin-field-error software-list-error" id="software-list-error" tabIndex={-1} role="alert">{fieldErrors["software-list-error"]}</div>}
          {items.length ? items.map((item, index) => <button type="button" key={item.slug + "-" + index} className={"software-manager-item " + (selectedIndex === index ? "is-selected " : "") + (itemHasErrors(index) ? "has-errors" : "")} onClick={() => setSelectedIndex(index)}><span className={"software-manager-swatch art-bg-" + item.accent} /><span><b>{item.name || "未命名作品"}</b><small>{item.category}{item.featured ? " · 精选" : ""}</small></span>{itemHasErrors(index) && <span className="software-manager-error-indicator" aria-label="此作品有待修正的字段" title="此作品有待修正的字段">!</span>}<ArrowDown className="software-manager-item-arrow" size={14} /></button>) : <p className="software-manager-empty">还没有作品模块，点击“新建作品”开始。</p>}
        </aside>
        {selected ? <div className="software-editor">
          <div className="software-editor-topline"><div><span className="eyebrow">EDIT MODULE / {String(selectedIndex + 1).padStart(2, "0")}</span><h3>{selected.name || "未命名作品"}</h3></div><div className="software-editor-actions"><button type="button" className="button button-outline" title="上移模块" aria-label="上移模块" disabled={selectedIndex <= 0} onClick={() => moveItem(-1)}><ArrowUp size={14} /></button><button type="button" className="button button-outline" title="下移模块" aria-label="下移模块" disabled={selectedIndex >= items.length - 1} onClick={() => moveItem(1)}><ArrowDown size={14} /></button>{selected.slug && <a className="button button-outline" href={"/software/" + selected.slug} target="_blank" rel="noreferrer"><ExternalLink size={14} /> 预览详情</a>}<button type="button" className="button button-outline software-delete-button" onClick={removeSelected}><Trash2 size={14} /> 删除</button></div></div>
          <div className="admin-fields-grid software-editor-fields">
            <Field id={fieldId("name")} label="作品名称" error={fieldError("name")}><input {...inputProps("name")} value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} maxLength={80} placeholder="例如：Mori Notes" /></Field>
            <Field id={fieldId("slug")} label="详情页地址标识" hint="只使用小写英文字母、数字和连字符；例如：mori-notes" error={fieldError("slug")}><input {...inputProps("slug")} value={selected.slug} onChange={(event) => updateSelected({ slug: event.target.value })} maxLength={60} placeholder="mori-notes" /></Field>
            <Field id={fieldId("tagline")} label="一句话副标题" error={fieldError("tagline")}><input {...inputProps("tagline")} value={selected.tagline} onChange={(event) => updateSelected({ tagline: event.target.value })} maxLength={140} placeholder="为作品写一句简短介绍" /></Field>
            <Field id={fieldId("category")} label="分类" error={fieldError("category")}><input {...inputProps("category")} value={selected.category} onChange={(event) => updateSelected({ category: event.target.value })} maxLength={60} placeholder="例如：效率工具" /></Field>
            <Field id={fieldId("description")} label="详细介绍" hint="显示在作品卡片详情页头部" error={fieldError("description")}><textarea {...inputProps("description")} value={selected.description} onChange={(event) => updateSelected({ description: event.target.value })} rows={4} maxLength={1200} placeholder="介绍作品解决的问题、适用场景和设计理念" /></Field>
            <Field id={fieldId("storyTitle")} label="详情故事标题" error={fieldError("storyTitle")}><input {...inputProps("storyTitle")} value={selected.storyTitle || ""} onChange={(event) => updateSelected({ storyTitle: event.target.value })} maxLength={160} placeholder="留空则使用默认标题" /></Field>
            <Field id={fieldId("storyBody")} label="详情故事正文" error={fieldError("storyBody")}><textarea {...inputProps("storyBody")} value={selected.storyBody || ""} onChange={(event) => updateSelected({ storyBody: event.target.value })} rows={4} maxLength={1200} placeholder="留空则根据详细介绍自动生成" /></Field>
            <Field id={fieldId("version")} label="版本号" error={fieldError("version")}><input {...inputProps("version")} value={selected.version} onChange={(event) => updateSelected({ version: event.target.value })} maxLength={30} placeholder="例如：1.0.0" /></Field>
            <Field id={fieldId("updatedAt")} label="最近更新日期" error={fieldError("updatedAt")}><input {...inputProps("updatedAt")} type="date" value={selected.updatedAt.slice(0, 10)} onChange={(event) => updateSelected({ updatedAt: event.target.value })} /></Field>
            <Field id={fieldId("visual")} label="界面示意类型"><select {...inputProps("visual")} value={selected.visual} onChange={(event) => updateSelected({ visual: event.target.value as SoftwareVisual })}>{softwareVisualOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
            <Field id={fieldId("accent")} label="卡片配色"><select {...inputProps("accent")} value={selected.accent} onChange={(event) => updateSelected({ accent: event.target.value })}><option value="mint">薄荷绿</option><option value="blue">雾霾蓝</option><option value="peach">蜜桃橙</option><option value="lilac">淡紫色</option><option value="gold">香槟金</option></select></Field>
            <label className="admin-switch software-featured-switch"><input type="checkbox" checked={selected.featured} onChange={(event) => updateSelected({ featured: event.target.checked })} /><span className="admin-switch-track" /><span><b>首页精选</b><small>开启后显示在首页精选作品区</small></span></label>
            <section className="software-pricing-settings" aria-label="软件价格与徽标设置">
              <div className="software-pricing-heading"><div><span className="eyebrow">PRICE IDENTITY</span><h4>价格标识与动效</h4><p>选择免费或付费，并为这款软件挑选专属徽标质感。</p></div><SoftwarePricingBadge priceType={selected.priceType} price={selected.price} badgeStyle={selected.badgeStyle} className="pricing-badge-preview" /></div>
              <div className="software-pricing-fields">
                <Field id={fieldId("priceType")} label="软件定价" error={fieldError("priceType")}><select {...inputProps("priceType")} value={selected.priceType} onChange={(event) => updateSelected({ priceType: event.target.value as SoftwarePriceType })}><option value="free">免费软件</option><option value="paid">付费软件</option></select></Field>
                {selected.priceType === "paid" && <Field id={fieldId("price")} label="价格说明（选填）" hint="例如：¥99、¥99 / 年、联系咨询" error={fieldError("price")}><input {...inputProps("price")} value={selected.price || ""} maxLength={32} onChange={(event) => updateSelected({ price: event.target.value })} placeholder="例如：¥99 / 年" /></Field>}
                <Field id={fieldId("badgeStyle")} label="徽标风格 · 六选一" error={fieldError("badgeStyle")}><select {...inputProps("badgeStyle")} value={selected.badgeStyle} onChange={(event) => updateSelected({ badgeStyle: event.target.value as SoftwareBadgeStyle })}>{softwareBadgeStyleOptions.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.description}</option>)}</select></Field>
              </div>
            </section>
            <div className="software-admin-image-block"><ImageControl id={fieldId("imageUrl")} label="封面 / 主展示图片" value={selected.imageUrl} error={fieldError("imageUrl")} busy={uploading === "cover"} onChange={(imageUrl) => updateSelected({ imageUrl })} onUpload={(file) => void upload(file, "cover", (imageUrl) => updateSelected({ imageUrl }))} />{selected.imageUrl && <div className="software-admin-preview-card"><Image src={selected.imageUrl} alt={selected.name + "封面预览"} fill unoptimized sizes="(max-width: 700px) 90vw, 460px" /></div>}</div>
            <Field id={fieldId("demoUrl")} label="演示视频链接" hint="填写网页或视频网址；点击作品详情页的“演示视频”按钮后将在新页面打开。" error={fieldError("demoUrl")}><input {...inputProps("demoUrl")} type="text" inputMode="url" value={selected.demoUrl || ""} onChange={(event) => updateSelected({ demoUrl: event.target.value })} placeholder="https://example.com/demo-video" /></Field>
            <Field id={fieldId("downloadUrl")} label="下载链接" hint="示例：https://example.com/download 或 /downloads/app.zip" error={fieldError("downloadUrl")}><input {...inputProps("downloadUrl")} type="text" inputMode="url" value={selected.downloadUrl || ""} onChange={(event) => updateSelected({ downloadUrl: event.target.value })} placeholder="https://example.com/download" /></Field>
            <Field id={fieldId("sourceUrl")} label="源代码链接" hint="示例：https://github.com/name/project" error={fieldError("sourceUrl")}><input {...inputProps("sourceUrl")} type="text" inputMode="url" value={selected.sourceUrl || ""} onChange={(event) => updateSelected({ sourceUrl: event.target.value })} placeholder="https://github.com/name/project" /></Field>
            <Field id={fieldId("documentationUrl")} label="文档链接" hint="示例：https://docs.example.com" error={fieldError("documentationUrl")}><input {...inputProps("documentationUrl")} type="text" inputMode="url" value={selected.documentationUrl || ""} onChange={(event) => updateSelected({ documentationUrl: event.target.value })} placeholder="https://docs.example.com" /></Field>
          </div>

          <div className={"software-repeat-section " + (fieldError("screenshots") ? "is-invalid" : "")} id={fieldId("screenshots")} tabIndex={-1}>
            <div className="software-repeat-heading"><div><span className="eyebrow">SCREEN GALLERY</span><h4>详情截图 / 展示图片 <small>{selected.screenshots.length}</small></h4></div><button type="button" className="button button-outline" disabled={selected.screenshots.length >= 12} onClick={() => updateSelected({ screenshots: [...selected.screenshots, { title: "", caption: "", visual: selected.visual, imageUrl: "", linkUrl: "" }] })}><ImagePlus size={14} /> 添加展示模块</button></div>
            {fieldError("screenshots") && <div className="admin-field-error" id={fieldId("screenshots") + "-error"} role="alert">{fieldError("screenshots")}</div>}
            {selected.screenshots.map((shot, index) => {
              const key = (name: string) => "screenshots." + index + "." + name;
              return <div className="software-screenshot-editor" key={"shot-" + index}><div className="software-screenshot-number">{String(index + 1).padStart(2, "0")}</div><div className="software-screenshot-fields">
                <Field id={fieldId(key("title"))} label="模块标题" error={fieldError(key("title"))}><input {...inputProps(key("title"))} value={shot.title} onChange={(event) => updateSelected({ screenshots: selected.screenshots.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row) })} placeholder="如：项目总览" /></Field>
                <Field id={fieldId(key("caption"))} label="模块说明" error={fieldError(key("caption"))}><input {...inputProps(key("caption"))} value={shot.caption} onChange={(event) => updateSelected({ screenshots: selected.screenshots.map((row, rowIndex) => rowIndex === index ? { ...row, caption: event.target.value } : row) })} placeholder="描述此截图展示的内容" /></Field>
                <Field id={fieldId(key("linkUrl"))} label="模块跳转链接" hint="填写后点击展示卡片可打开链接；需要查看示意图时点击卡片下方的“查看截图”" error={fieldError(key("linkUrl"))}><input {...inputProps(key("linkUrl"))} type="text" inputMode="url" value={shot.linkUrl || ""} onChange={(event) => updateSelected({ screenshots: selected.screenshots.map((row, rowIndex) => rowIndex === index ? { ...row, linkUrl: event.target.value } : row) })} placeholder="https://example.com 或 /page" /></Field>
                <Field id={fieldId(key("visual"))} label="无图片时使用的界面示意"><select {...inputProps(key("visual"))} value={shot.visual} onChange={(event) => updateSelected({ screenshots: selected.screenshots.map((row, rowIndex) => rowIndex === index ? { ...row, visual: event.target.value as SoftwareVisual } : row) })}>{softwareVisualOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
                <button type="button" className="software-row-remove" aria-label="删除展示模块" onClick={() => updateSelected({ screenshots: selected.screenshots.filter((_, rowIndex) => rowIndex !== index) })}><Trash2 size={15} /> 移除模块</button>
                <ImageControl id={fieldId(key("imageUrl"))} label="此模块图片" value={shot.imageUrl} error={fieldError(key("imageUrl"))} busy={uploading === "shot-" + index} onChange={(imageUrl) => updateSelected({ screenshots: selected.screenshots.map((row, rowIndex) => rowIndex === index ? { ...row, imageUrl } : row) })} onUpload={(file) => void upload(file, "shot-" + index, (imageUrl) => updateSelected({ screenshots: selected.screenshots.map((row, rowIndex) => rowIndex === index ? { ...row, imageUrl } : row) }))} />
              </div></div>;
            })}
          </div>
        </div> : <div className="software-manager-empty-state"><ImagePlus size={24} /><b>尚未添加作品模块</b><span>新建模块后即可设置图片、链接与文案。</span></div>}
      </div>}
    </section>
  );
}