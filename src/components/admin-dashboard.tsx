"use client";

import { Check, LogIn, LogOut, RotateCcw, Save, Settings2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { SiteSettings } from "@/lib/site-settings";
import { softwareLayoutOptions } from "@/lib/software-layout";
import { SoftwareManager } from "@/components/software-manager";

const defaultForm: SiteSettings = {
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

type Status = { type: "success" | "error" | "info"; message: string } | null;

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="admin-field">
      <span className="admin-field-label">{label}</span>
      {children}
      {hint && <span className="admin-field-hint">{hint}</span>}
    </label>
  );
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [form, setForm] = useState<SiteSettings>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const loadSettings = useCallback(async (candidate: string) => {
    if (!candidate.trim()) {
      setStatus({ type: "error", message: "请输入管理员口令。" });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/settings", {
        headers: { "x-admin-token": candidate.trim() },
        cache: "no-store",
      });
      const data = await response.json() as SiteSettings & { error?: string };
      if (!response.ok) throw new Error(data.error || "登录失败，请检查管理员口令。 ");
      setForm({ ...defaultForm, ...data });
      setToken(candidate.trim());
      setAuthenticated(true);
      window.sessionStorage.setItem("site-admin-token", candidate.trim());
      setStatus({ type: "success", message: "已连接到后台设置。" });
    } catch (error) {
      setAuthenticated(false);
      window.sessionStorage.removeItem("site-admin-token");
      setStatus({ type: "error", message: error instanceof Error ? error.message : "登录失败，请稍后重试。" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = window.sessionStorage.getItem("site-admin-token");
    if (!savedToken) return;
    const timer = window.setTimeout(() => { void loadSettings(savedToken); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSettings]);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (status?.type === "success") setStatus(null);
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) {
      setAuthenticated(false);
      setStatus({ type: "error", message: "登录状态已失效，请重新输入管理员口令。" });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json", "x-admin-token": token.trim() },
        body: JSON.stringify(form),
      });
      const data = await response.json() as SiteSettings & { error?: string };
      if (!response.ok) throw new Error(data.error || "保存失败，请检查设置内容。 ");
      setForm({ ...defaultForm, ...data });
      setStatus({ type: "success", message: "设置已保存，刷新前台即可看到最新效果。" });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "保存失败，请稍后重试。" });
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    window.sessionStorage.removeItem("site-admin-token");
    setToken("");
    setAuthenticated(false);
    setForm(defaultForm);
    setStatus({ type: "info", message: "已退出后台。" });
  }

  function resetForm() {
    setForm(defaultForm);
    setStatus({ type: "info", message: "已恢复为内置默认值，点击保存后才会写入网站。" });
  }

  return (
    <div className="admin-shell">
      <div className="admin-topline">
        <div>
          <span className="eyebrow">SITE CONTROL / ADMIN</span>
          <h1>网站后台<span className="heading-dot">.</span></h1>
          <p>统一管理品牌信息、首页内容、主题颜色与互动效果。</p>
        </div>
        <div className="admin-topline-mark"><Settings2 size={21} /><span>LOCAL<br />CONTROL</span></div>
      </div>

      {!authenticated ? (
        <section className="admin-login-card">
          <div className="admin-login-icon"><ShieldCheck size={24} /></div>
          <div className="admin-login-copy">
            <span className="eyebrow">PRIVATE AREA</span>
            <h2>登录系统设置</h2>
            <p>管理员口令只保存在当前浏览器会话中，不会写入网站内容。</p>
          </div>
          <form className="admin-login-form" onSubmit={(event) => { event.preventDefault(); void loadSettings(token); }}>
            <label className="admin-field admin-token-field">
              <span className="admin-field-label">管理员口令</span>
              <input value={token} onChange={(event) => setToken(event.target.value)} type="password" autoComplete="current-password" placeholder="输入 ADMIN_TOKEN" />
            </label>
            <button className="button button-dark" type="submit" disabled={loading}>{loading ? "连接中…" : "进入后台"} <LogIn size={16} /></button>
          </form>
          <p className="admin-login-hint">管理员口令由项目根目录的 <code>.env.local</code> 文件配置；请勿将该文件分享或提交到代码仓库。</p>
        </section>
      ) : (
        <form className="admin-settings-form" onSubmit={saveSettings}>
          <div className="admin-toolbar">
            <div className="admin-auth-state"><span className="admin-status-dot" /> 已登录 · 设置将写入 <code>data/site-settings.json</code></div>
            <div className="admin-toolbar-actions">
              <button className="button button-outline" type="button" onClick={resetForm}><RotateCcw size={15} /> 恢复默认</button>
              <button className="button button-outline" type="button" onClick={logout}><LogOut size={15} /> 退出</button>
              <button className="button button-dark" type="submit" disabled={saving}>{saving ? "保存中…" : "保存设置"} <Save size={15} /></button>
            </div>
          </div>

          {status && <div className={`admin-status admin-status-${status.type}`} role="status">{status.type === "success" ? <Check size={16} /> : <span className="admin-status-symbol">{status.type === "error" ? "!" : "i"}</span>}<span>{status.message}</span></div>}

          <div className="admin-grid">
            <section className="admin-card">
              <div className="admin-card-heading"><span className="admin-card-index">01</span><div><span className="eyebrow">BRAND SYSTEM</span><h2>品牌与联系</h2></div></div>
              <div className="admin-fields-grid">
                <Field label="网站名称"><input value={form.siteName} onChange={(event) => update("siteName", event.target.value)} maxLength={50} /></Field>
                <Field label="品牌副标题"><input value={form.brandSubtitle} onChange={(event) => update("brandSubtitle", event.target.value)} maxLength={80} /></Field>
                <Field label="联系邮箱"><input value={form.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} type="email" maxLength={160} /></Field>
                <Field label="SEO 描述" hint="用于搜索引擎与分享卡片"><textarea value={form.siteDescription} onChange={(event) => update("siteDescription", event.target.value)} rows={3} maxLength={240} /></Field>
                <Field label="GitHub 地址"><input value={form.githubUrl} onChange={(event) => update("githubUrl", event.target.value)} type="url" /></Field>
                <Field label="Instagram 地址"><input value={form.instagramUrl} onChange={(event) => update("instagramUrl", event.target.value)} type="url" /></Field>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-heading"><span className="admin-card-index">02</span><div><span className="eyebrow">HOMEPAGE COPY</span><h2>首页内容</h2></div></div>
              <div className="admin-fields-grid">
                <Field label="首页标题上半句"><input value={form.heroTitle} onChange={(event) => update("heroTitle", event.target.value)} maxLength={80} /></Field>
                <Field label="首页标题强调句"><input value={form.heroHighlight} onChange={(event) => update("heroHighlight", event.target.value)} maxLength={80} /></Field>
                <Field label="首页简介"><textarea value={form.heroDescription} onChange={(event) => update("heroDescription", event.target.value)} rows={3} maxLength={240} /></Field>
                <Field label="公告内容" hint="会显示在首页与作品详情页"><textarea value={form.announcement} onChange={(event) => update("announcement", event.target.value)} rows={3} maxLength={240} /></Field>
              </div>
            </section>


            <section className="admin-card">
              <div className="admin-card-heading"><span className="admin-card-index">03</span><div><span className="eyebrow">ABOUT PAGE COPY</span><h2>关于我页面</h2></div></div>
              <div className="admin-fields-grid">
                <Field label="浏览器页面标题"><input value={form.aboutMetaTitle} onChange={(event) => update("aboutMetaTitle", event.target.value)} maxLength={80} /></Field>
                <Field label="页面顶部标识"><input value={form.aboutTopline} onChange={(event) => update("aboutTopline", event.target.value)} maxLength={80} /></Field>
                <Field label="主标题眉题"><input value={form.aboutHeroEyebrow} onChange={(event) => update("aboutHeroEyebrow", event.target.value)} maxLength={80} /></Field>
                <Field label="主标题上半句"><input value={form.aboutTitleLead} onChange={(event) => update("aboutTitleLead", event.target.value)} maxLength={100} /></Field>
                <Field label="主标题强调句"><input value={form.aboutTitleHighlight} onChange={(event) => update("aboutTitleHighlight", event.target.value)} maxLength={100} /></Field>
                <Field label="主介绍"><textarea value={form.aboutDescription} onChange={(event) => update("aboutDescription", event.target.value)} rows={3} maxLength={500} /></Field>
                <Field label="理念区眉题"><input value={form.aboutManifestoEyebrow} onChange={(event) => update("aboutManifestoEyebrow", event.target.value)} maxLength={80} /></Field>
                <Field label="理念区标题上半句"><input value={form.aboutManifestoTitleLead} onChange={(event) => update("aboutManifestoTitleLead", event.target.value)} maxLength={100} /></Field>
                <Field label="理念区标题强调句"><input value={form.aboutManifestoTitleHighlight} onChange={(event) => update("aboutManifestoTitleHighlight", event.target.value)} maxLength={100} /></Field>
                <Field label="理念区正文"><textarea value={form.aboutManifestoDescription} onChange={(event) => update("aboutManifestoDescription", event.target.value)} rows={4} maxLength={800} /></Field>
                <Field label="价值观区眉题"><input value={form.aboutValuesEyebrow} onChange={(event) => update("aboutValuesEyebrow", event.target.value)} maxLength={80} /></Field>
                <Field label="价值观区标题"><input value={form.aboutValuesTitle} onChange={(event) => update("aboutValuesTitle", event.target.value)} maxLength={100} /></Field>
                <Field label="价值观一标题"><input value={form.aboutValueOneTitle} onChange={(event) => update("aboutValueOneTitle", event.target.value)} maxLength={80} /></Field>
                <Field label="价值观一正文"><textarea value={form.aboutValueOneText} onChange={(event) => update("aboutValueOneText", event.target.value)} rows={3} maxLength={300} /></Field>
                <Field label="价值观二标题"><input value={form.aboutValueTwoTitle} onChange={(event) => update("aboutValueTwoTitle", event.target.value)} maxLength={80} /></Field>
                <Field label="价值观二正文"><textarea value={form.aboutValueTwoText} onChange={(event) => update("aboutValueTwoText", event.target.value)} rows={3} maxLength={300} /></Field>
                <Field label="价值观三标题"><input value={form.aboutValueThreeTitle} onChange={(event) => update("aboutValueThreeTitle", event.target.value)} maxLength={80} /></Field>
                <Field label="价值观三正文"><textarea value={form.aboutValueThreeText} onChange={(event) => update("aboutValueThreeText", event.target.value)} rows={3} maxLength={300} /></Field>
                <Field label="底部眉题"><input value={form.aboutSignoffEyebrow} onChange={(event) => update("aboutSignoffEyebrow", event.target.value)} maxLength={100} /></Field>
                <Field label="底部标题上半句"><input value={form.aboutSignoffTitleLead} onChange={(event) => update("aboutSignoffTitleLead", event.target.value)} maxLength={100} /></Field>
                <Field label="底部标题强调句"><input value={form.aboutSignoffTitleHighlight} onChange={(event) => update("aboutSignoffTitleHighlight", event.target.value)} maxLength={100} /></Field>
                <Field label="作品入口按钮"><input value={form.aboutWorksLinkText} onChange={(event) => update("aboutWorksLinkText", event.target.value)} maxLength={80} /></Field>
                <Field label="邮件入口按钮"><input value={form.aboutEmailLinkText} onChange={(event) => update("aboutEmailLinkText", event.target.value)} maxLength={80} /></Field>
                <Field label="底部联系按钮"><input value={form.aboutContactButtonText} onChange={(event) => update("aboutContactButtonText", event.target.value)} maxLength={80} /></Field>
              </div>
            </section>
            <section className="admin-card">
              <div className="admin-card-heading"><span className="admin-card-index">04</span><div><span className="eyebrow">VISUAL DIRECTION</span><h2>视觉与互动</h2></div></div>
              <div className="admin-fields-grid admin-fields-visual">
                <Field label="主品牌色"><div className="admin-color-control"><input type="color" value={form.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} /><input value={form.primaryColor} onChange={(event) => update("primaryColor", event.target.value)} maxLength={7} /></div></Field>
                <Field label="强调色"><div className="admin-color-control"><input type="color" value={form.accentColor} onChange={(event) => update("accentColor", event.target.value)} /><input value={form.accentColor} onChange={(event) => update("accentColor", event.target.value)} maxLength={7} /></div></Field>
                <Field label="默认主题"><select value={form.defaultTheme} onChange={(event) => update("defaultTheme", event.target.value as SiteSettings["defaultTheme"])}><option value="light">浅色主题</option><option value="dark">深色主题</option></select></Field>
                <Field label="软件作品展示方式" hint="首页与软件作品页同步使用，保存后生效"><select value={form.softwareLayout} onChange={(event) => update("softwareLayout", event.target.value as SiteSettings["softwareLayout"])}>{softwareLayoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.description}</option>)}</select></Field>
                <label className="admin-switch"><input type="checkbox" checked={form.showParticles} onChange={(event) => update("showParticles", event.target.checked)} /><span className="admin-switch-track" /><span><b>粒子与连线效果</b><small>首页展示光点互动背景</small></span></label>
                <label className="admin-switch"><input type="checkbox" checked={form.showDemoNotice} onChange={(event) => update("showDemoNotice", event.target.checked)} /><span className="admin-switch-track" /><span><b>显示公告栏</b><small>首页与作品页显示站点公告</small></span></label>
              </div>
            </section>
          </div>

          <SoftwareManager token={token} />
          <div className="admin-bottom-note"><ShieldCheck size={16} /><span>设置文件适合单机 Node.js 部署。若部署到无持久化文件系统的平台，请将存储层迁移到数据库或持久化卷。</span></div>
        </form>
      )}
    </div>
  );
}


