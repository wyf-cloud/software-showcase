"use client";

import { ArrowDown, ArrowUp, ArrowUpRight, Check, CloudUpload, Eye, ImagePlus, LoaderCircle, LogIn, Megaphone, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { withSiteBasePath } from "@/lib/site-path";
import type { AdPlacement, Advertisement, AdvertisementsConfig } from "@/lib/advertisements";

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
const placementLabels: Record<AdPlacement, string> = { announcement: "顶部滚动公告", popup: "进站弹窗", "home-mid": "首页中段横幅" };
const emptyConfig: AdvertisementsConfig = { version: 1, ads: [] };
type Feedback = { type: "success" | "error" | "info"; message: string } | null;
type PublishEvent = { type: "progress" | "log" | "complete"; percent: number; message: string; detail?: string; success?: boolean };

function makeAd(placement: AdPlacement = "home-mid", order = 0): Advertisement {
  return {
    id: globalThis.crypto?.randomUUID?.() || `ad-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    placement, title: "", text: "", imageUrl: "", href: "", buttonText: "了解详情", enabled: false,
    order, startsAt: "", endsAt: "", device: "all", popupDelaySeconds: 3, popupFrequency: "daily-limit", popupDailyLimit: 1,
  };
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="admin-field"><span className="admin-field-label">{label}</span>{children}{hint && <span className="admin-field-hint">{hint}</span>}</label>;
}

export function AdsAdminDashboard() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [config, setConfig] = useState<AdvertisementsConfig>(emptyConfig);
  const [selectedId, setSelectedId] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
  const [publishPercent, setPublishPercent] = useState(0);
  const [publishDetails, setPublishDetails] = useState<string[]>([]);
  const [publishResult, setPublishResult] = useState<"success" | "error" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const selectedAd = config.ads.find((ad) => ad.id === selectedId) || null;
  const previewAd = config.ads.find((ad) => ad.id === previewId) || null;
  const orderedAds = useMemo(() => [...config.ads].sort((a, b) => a.order - b.order), [config.ads]);

  const loadAds = useCallback(async (candidate: string) => {
    if (!candidate.trim()) { setFeedback({ type: "error", message: "请输入管理员口令。" }); return; }
    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/admin/ads", { headers: { "x-admin-token": candidate.trim() }, cache: "no-store" });
      const data = await response.json() as AdvertisementsConfig & { error?: string };
      if (!response.ok) throw new Error(data.error || "无法读取广告配置。");
      setConfig(data);
      setToken(candidate.trim());
      setAuthenticated(true);
      window.sessionStorage.setItem("site-admin-token", candidate.trim());
      setFeedback({ type: "success", message: `已连接后台，当前有 ${data.ads.length} 条广告配置。` });
    } catch (error) {
      setAuthenticated(false);
      window.sessionStorage.removeItem("site-admin-token");
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "连接后台失败。" });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (isStaticExport) return;
    const savedToken = window.sessionStorage.getItem("site-admin-token");
    if (!savedToken) return;
    const timer = window.setTimeout(() => { void loadAds(savedToken); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAds]);

  function updateAd<K extends keyof Advertisement>(key: K, value: Advertisement[K]) {
    if (!selectedAd) return;
    setConfig((current) => ({ ...current, ads: current.ads.map((ad) => ad.id === selectedAd.id ? { ...ad, [key]: value } : ad) }));
    setPublishResult(null);
  }

  function addAd(placement: AdPlacement) {
    const ad = makeAd(placement, config.ads.length);
    setConfig((current) => ({ ...current, ads: [...current.ads, ad] }));
    setSelectedId(ad.id);
    setFeedback({ type: "info", message: `已新增${placementLabels[placement]}草稿；填写内容后可保存到本机或发布。` });
  }

  function reorder(adId: string, direction: -1 | 1) {
    const rows = [...orderedAds];
    const index = rows.findIndex((ad) => ad.id === adId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) return;
    [rows[index], rows[nextIndex]] = [rows[nextIndex], rows[index]];
    setConfig((current) => ({ ...current, ads: rows.map((ad, order) => ({ ...ad, order })) }));
    setPublishResult(null);
  }

  function deleteAd(adId: string) {
    const ad = config.ads.find((item) => item.id === adId);
    if (!ad || !window.confirm(`删除广告“${ad.title || placementLabels[ad.placement]}”？`)) return;
    const next = orderedAds.filter((item) => item.id !== adId).map((item, order) => ({ ...item, order }));
    setConfig((current) => ({ ...current, ads: next }));
    setSelectedId(next[0]?.id || "");
    setPreviewId("");
    setPublishResult(null);
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!token) { setFeedback({ type: "error", message: "登录状态已失效，请重新登录。" }); return; }
    const body = new FormData();
    body.set("file", file);
    setFeedback({ type: "info", message: "正在上传广告图片…" });
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-token": token }, body });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "图片上传失败。");
      updateAd("imageUrl", result.url);
      setFeedback({ type: "success", message: "图片已上传到本机素材目录；可先保存到本机，或点击“保存并发布”推送。" });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "图片上传失败。" });
    }
  }

  async function publishAds() {
    if (!token) { setAuthenticated(false); setFeedback({ type: "error", message: "登录状态已失效，请重新输入管理员口令。" }); return; }
    setPublishing(true);
    setPublishMessage("正在准备广告专用发布…");
    setPublishPercent(0);
    setPublishDetails([]);
    setPublishResult(null);
    try {
      const response = await fetch("/api/admin/ads/publish", { method: "POST", headers: { "x-admin-token": token } });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        throw new Error(body.error || "广告发布请求失败。");
      }
      if (!response.body) throw new Error("浏览器未能读取发布进度。");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result: "success" | "error" | null = null;
      const handleFrame = (frame: string) => {
        const line = frame.split(/\r?\n/).find((part) => part.startsWith("data: "));
        if (!line) return;
        const event = JSON.parse(line.slice(6)) as PublishEvent;
        setPublishPercent(event.percent);
        if (event.message) setPublishMessage(event.message);
        if (event.detail) setPublishDetails((current) => [...current, event.detail!].slice(-8));
        if (event.type === "complete") result = event.success ? "success" : "error";
      };
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() || "";
        frames.forEach(handleFrame);
        if (done) break;
      }
      if (buffer.trim()) handleFrame(buffer);
      if (!result) throw new Error("发布连接提前结束，请稍后重试。");
      setPublishResult(result);
      if (result === "success") setFeedback({ type: "success", message: "配置已保存并推送；线上更新以 GitHub Actions 部署完成为准。" });
      else setFeedback({ type: "error", message: "配置已保存在本机，但推送未完成；修复后可使用“重试发布”。" });
    } catch (error) {
      setPublishResult("error");
      setPublishMessage(error instanceof Error ? error.message : "广告发布失败。");
      setFeedback({ type: "error", message: "配置已保存在本机，发布失败后可重试。" });
    } finally { setPublishing(false); }
  }

  async function persistAdsLocally() {
    if (!token) {
      setAuthenticated(false);
      throw new Error("登录状态已失效，请重新输入管理员口令。");
    }
    const response = await fetch("/api/admin/ads", { method: "PUT", headers: { "content-type": "application/json", "x-admin-token": token }, body: JSON.stringify(config) });
    const data = await response.json() as AdvertisementsConfig & { error?: string };
    if (!response.ok) throw new Error(data.error || "广告配置校验失败。");
    setConfig(data);
  }

  async function saveAdsLocally() {
    setSaving(true);
    setFeedback(null);
    try {
      await persistAdsLocally();
      setFeedback({ type: "success", message: "广告配置已保存到本机文件，未推送到仓库。" });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "保存广告配置失败。" });
    } finally { setSaving(false); }
  }

  async function saveAndPublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await persistAdsLocally();
      setFeedback({ type: "success", message: "广告配置已写入本机文件，正在推送到 GitHub…" });
      await publishAds();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "保存广告配置失败。" });
    } finally { setSaving(false); }
  }

  const visiblePreview = previewAd || selectedAd;

  return (
    <div className="admin-shell ads-admin-shell">
      <div className="admin-topline">
        <div><span className="eyebrow">CAMPAIGN CONTROL / ADMIN</span><h1>广告管理<span className="heading-dot">.</span></h1><p>管理顶部滚动公告、进站弹窗与首页中段广告，并通过广告专用提交发布。</p></div>
        <div className="ads-admin-topline-mark"><Megaphone size={22} /><span>LOCAL<br />CAMPAIGNS</span></div>
      </div>

      {isStaticExport && <div className="admin-status admin-status-info" role="status"><ShieldCheck size={16} /><span>当前为 GitHub Pages 静态版。广告管理与保存发布仅在本机 Node.js 后台运行。</span></div>}
      {feedback && <div className={`admin-status admin-status-${feedback.type}`} role="status" aria-live="polite">{feedback.type === "success" ? <Check size={16} /> : <span className="admin-status-symbol">{feedback.type === "error" ? "!" : "i"}</span>}<span>{feedback.message}</span></div>}

      {!authenticated ? (
        <section className="admin-login-card">
          <div className="admin-login-icon"><ShieldCheck size={24} /></div>
          <div className="admin-login-copy"><span className="eyebrow">PRIVATE AREA</span><h2>登录广告管理</h2><p>管理员口令仅保存在当前浏览器会话中。</p></div>
          <form className="admin-login-form" onSubmit={(event) => { event.preventDefault(); void loadAds(token); }}>
            <label className="admin-field admin-token-field"><span className="admin-field-label">管理员口令</span><input value={token} onChange={(event) => setToken(event.target.value)} type="password" autoComplete="current-password" placeholder="输入 ADMIN_TOKEN" disabled={isStaticExport} /></label>
            <button className="button button-dark" type="submit" disabled={loading || isStaticExport}>{loading ? "连接中…" : "进入后台"} <LogIn size={16} /></button>
          </form>
          <p className="admin-login-hint">在本机启动 Node.js 后台后管理；GitHub Pages 静态站点不具备写入配置或推送能力。</p>
        </section>
      ) : (
        <form className="ads-admin-content" onSubmit={saveAndPublish}>
          <div className="admin-toolbar">
            <div className="admin-auth-state"><span className="admin-status-dot" />已登录 · 配置写入 <code>data/advertisements.json</code></div>
            <div className="admin-toolbar-actions">
              <button className="button button-outline" type="button" onClick={() => { window.sessionStorage.removeItem("site-admin-token"); setAuthenticated(false); setToken(""); }}><LogIn size={15} />退出</button>
              <button className="button button-outline" type="button" onClick={() => void loadAds(token)} disabled={loading}>重新读取</button>
              <button className="button button-outline" type="button" onClick={() => void saveAdsLocally()} disabled={saving || publishing} title="仅写入本机广告配置，不推送仓库或触发部署">{saving ? <LoaderCircle className="admin-sync-spinner" size={15} /> : <Save size={15} />}{saving ? "保存中…" : "仅保存本地"}</button>
              <button className="button button-dark" type="submit" disabled={saving || publishing}>{saving ? <LoaderCircle className="admin-sync-spinner" size={15} /> : <CloudUpload size={15} />}{saving ? "保存中…" : publishing ? "发布中…" : "保存并发布"}</button>
            </div>
          </div>

          {publishMessage && <section className={`admin-card ads-publish-status ${publishResult === "error" ? "is-error" : publishResult === "success" ? "is-success" : ""}`} role="status" aria-live="polite">
            <div className="ads-publish-heading"><div><span className="eyebrow">PUBLISH PIPELINE</span><h2>{publishMessage}</h2></div><span>{publishPercent}%</span></div>
            <div className="admin-github-sync-progress-track" aria-hidden="true"><span style={{ width: `${publishPercent}%` }} /></div>
            {publishDetails.length > 0 && <ul className="admin-github-sync-details">{publishDetails.map((detail, index) => <li key={`${detail}-${index}`}>{detail}</li>)}</ul>}
            {publishResult === "error" && <button type="button" className="button button-outline" onClick={() => void publishAds()} disabled={publishing}><CloudUpload size={15} />{publishing ? "重试中…" : "重试发布"}</button>}
            {publishResult === "success" && <p className="ads-publish-note">GitHub Actions 已接手构建与部署；可从后台网站设置页打开部署状态。</p>}
          </section>}

          <div className="ads-admin-layout">
            <aside className="admin-card ads-admin-list-card">
              <div className="ads-admin-list-heading"><div><span className="eyebrow">AD INVENTORY</span><h2>广告列表 <span>{orderedAds.length}</span></h2></div><div className="ads-admin-add-menu">
                <button type="button" className="button button-outline" onClick={() => addAd("announcement")}><Plus size={15} />公告</button>
                <button type="button" className="button button-outline" onClick={() => addAd("popup")}><Plus size={15} />弹窗</button>
                <button type="button" className="button button-outline" onClick={() => addAd("home-mid")}><Plus size={15} />首页横幅</button>
              </div></div>
              {orderedAds.length === 0 ? <div className="ads-admin-empty"><Megaphone size={23} /><strong>还没有广告</strong><span>添加广告位后，可在右侧编辑、预览和发布。</span></div> : (
                <ul className="ads-admin-list">
                  {orderedAds.map((ad, index) => <li key={ad.id} className={`ads-admin-list-item ${selectedId === ad.id ? "is-selected" : ""}`}>
                    <button className="ads-admin-list-select" type="button" onClick={() => { setSelectedId(ad.id); setPreviewId(""); }}>
                      <span className={`ads-admin-list-status ${ad.enabled ? "is-on" : ""}`} aria-label={ad.enabled ? "已启用" : "已停用"} />
                      <span className="ads-admin-list-copy"><strong>{ad.title || "未命名广告"}</strong><small>{placementLabels[ad.placement]} · {ad.enabled ? "已启用" : "草稿/停用"}</small></span>
                    </button>
                    <div className="ads-admin-list-actions">
                      <button type="button" className="icon-button" onClick={() => { setSelectedId(ad.id); setPreviewId(ad.id); }} aria-label={`预览${ad.title || "广告"}`}><Eye size={15} /></button>
                      <button type="button" className="icon-button" onClick={() => reorder(ad.id, -1)} disabled={index === 0} aria-label="上移"><ArrowUp size={15} /></button>
                      <button type="button" className="icon-button" onClick={() => reorder(ad.id, 1)} disabled={index === orderedAds.length - 1} aria-label="下移"><ArrowDown size={15} /></button>
                      <button type="button" className="icon-button is-danger" onClick={() => deleteAd(ad.id)} aria-label={`删除${ad.title || "广告"}`}><Trash2 size={15} /></button>
                    </div>
                  </li>)}
                </ul>
              )}
            </aside>

            <section className="admin-card ads-admin-editor-card">
              <div className="admin-card-heading"><span className="admin-card-index">01</span><div><span className="eyebrow">CAMPAIGN DETAILS</span><h2>{selectedAd ? "编辑广告" : "选择或新增广告"}</h2></div></div>
              {selectedAd ? (
                <div className="admin-fields-grid ads-admin-fields">
                  <Field label="广告位"><select value={selectedAd.placement} onChange={(event) => updateAd("placement", event.target.value as AdPlacement)}>{Object.entries(placementLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></Field>
                  <Field label="标题"><input value={selectedAd.title} onChange={(event) => updateAd("title", event.target.value)} maxLength={100} placeholder="填写广告标题" /></Field>
                  <Field label="广告文案"><textarea value={selectedAd.text} onChange={(event) => updateAd("text", event.target.value)} rows={3} maxLength={500} placeholder="用简短文案说明推广内容" /></Field>
                  <Field label="图片素材" hint="支持 JPG、PNG、WebP、AVIF 或 GIF，单张不超过 8MB；仅上传到本机目录。">
                    <div className="ads-admin-image-control"><input value={selectedAd.imageUrl} onChange={(event) => updateAd("imageUrl", event.target.value)} placeholder="上传后自动填入素材路径" readOnly /><button className="button button-outline" type="button" onClick={() => fileInput.current?.click()}><ImagePlus size={15} />上传图片</button><input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={(event) => void uploadImage(event)} /></div>
                    {selectedAd.imageUrl && <Image unoptimized width={1200} height={800} className="ads-admin-image-preview" src={withSiteBasePath(selectedAd.imageUrl)} alt="广告素材预览" />}
                  </Field>
                  <Field label="跳转链接" hint="仅支持 http(s) 外链或以 / 开头的站内路径"><input value={selectedAd.href} onChange={(event) => updateAd("href", event.target.value)} maxLength={500} placeholder="https://example.com 或 /software" /></Field>
                  <Field label="按钮文字"><input value={selectedAd.buttonText} onChange={(event) => updateAd("buttonText", event.target.value)} maxLength={40} /></Field>
                  <Field label="展示设备"><select value={selectedAd.device} onChange={(event) => updateAd("device", event.target.value as Advertisement["device"])}><option value="all">全部设备</option><option value="desktop">仅桌面端</option><option value="mobile">仅移动端</option></select></Field>
                  <Field label="生效时间"><input type="datetime-local" value={selectedAd.startsAt} onChange={(event) => updateAd("startsAt", event.target.value)} /></Field>
                  <Field label="结束时间"><input type="datetime-local" value={selectedAd.endsAt} onChange={(event) => updateAd("endsAt", event.target.value)} /></Field>
                  {selectedAd.placement === "popup" && <>
                    <Field label="进站后延迟（秒）"><input type="number" min={0} max={120} step={1} value={selectedAd.popupDelaySeconds} onChange={(event) => updateAd("popupDelaySeconds", Number(event.target.value))} /></Field>
                    <Field label="关闭后的展示频次" hint="每次打开期间最多弹出一次；每天次数按本地自然日统计。"><select value={selectedAd.popupFrequency} onChange={(event) => updateAd("popupFrequency", event.target.value as Advertisement["popupFrequency"])}><option value="every-open">每次打开网站都显示</option><option value="daily-limit">每天显示指定次数</option></select></Field>
                    {selectedAd.popupFrequency === "daily-limit" && <Field label="每天展示次数" hint="每次弹出计 1 次，可设置 1–20 次。"><input type="number" min={1} max={20} step={1} value={selectedAd.popupDailyLimit} onChange={(event) => updateAd("popupDailyLimit", Number(event.target.value))} /></Field>}
                  </>}
                  <label className="admin-switch ads-admin-enabled"><input type="checkbox" checked={selectedAd.enabled} onChange={(event) => updateAd("enabled", event.target.checked)} /><span className="admin-switch-track" /><span><b>{selectedAd.enabled ? "广告已启用" : "广告已停用"}</b><small>未启用的广告不会出现在网站前台</small></span></label>
                </div>
              ) : <div className="ads-admin-empty ads-admin-editor-empty"><span>从左侧添加一条广告，或选择已有配置。</span></div>}
              {selectedAd && <div className="ads-admin-editor-actions"><button type="button" className="button button-outline" onClick={() => setPreviewId(previewId === selectedAd.id ? "" : selectedAd.id)}><Eye size={15} />{previewId === selectedAd.id ? "收起预览" : "预览效果"}</button><button type="button" className="button button-outline is-danger" onClick={() => deleteAd(selectedAd.id)}><Trash2 size={15} />删除广告</button></div>}
            </section>
          </div>

          {visiblePreview && previewId && <section className="admin-card ads-admin-preview-card"><div className="admin-card-heading"><span className="admin-card-index">02</span><div><span className="eyebrow">LIVE PREVIEW</span><h2>广告效果预览 · {placementLabels[visiblePreview.placement]}</h2></div></div><div className={`ads-admin-preview ads-preview-${visiblePreview.placement}`}>
            {visiblePreview.placement === "announcement" ? <div className="announcement-ad-bar"><div className="page-shell announcement-ad-inner"><span className="announcement-ad-label"><Megaphone size={13} />广告</span><div className="announcement-ad-item"><strong>{visiblePreview.title || "广告标题"}</strong><span>{visiblePreview.text || "广告文案将在此显示"}</span><ArrowUpRight size={13} /></div></div></div> : <div className="ads-admin-preview-content">{visiblePreview.imageUrl && <Image unoptimized width={1200} height={800} src={withSiteBasePath(visiblePreview.imageUrl)} alt="" /> }<span className="eyebrow">SPONSORED</span><strong>{visiblePreview.title || "广告标题"}</strong><p>{visiblePreview.text || "广告文案将在此显示"}</p>{visiblePreview.href && <span className="button button-dark">{visiblePreview.buttonText || "了解详情"}<ArrowUpRight size={15} /></span>}</div>}
          </div></section>}


          <div className="admin-bottom-note"><ShieldCheck size={16} /><span>前台只读取后台管理的图片、文案和链接，不执行第三方广告脚本。广告需明确标注，线上更新以 GitHub Pages 部署完成为准。</span></div>
        </form>
      )}
    </div>
  );
}
