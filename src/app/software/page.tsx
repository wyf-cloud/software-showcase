import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SoftwareExplorer } from "@/components/software-explorer";
import { DemoNotice } from "@/components/demo-notice";
import { readSoftware } from "@/lib/software-settings";
import { readSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "软件作品",
  description: "浏览独立开发的软件作品、效率工具与创意应用。",
};

export default async function SoftwarePage() {
  const settings = await readSiteSettings();
  const softwareItems = await readSoftware();
  return (
    <main className="catalog-page page-shell">
      <div className="page-topline"><span>THE WORK INDEX</span><span>2024 — 2026 <i /></span></div>
      <section className="catalog-heading"><div className="eyebrow"><span className="live-dot" /> THE SOFTWARE COLLECTION</div><h1>每一个小工具，<br /><em>都有它的理由。</em></h1><p>从效率、创作到日常生活，看看这些正在慢慢长大的小作品。</p><div className="catalog-heading-meta"><span>{String(softwareItems.length).padStart(2, "0")} 个作品</span><span>独立构思 · 持续打磨</span></div></section>
      {settings.showDemoNotice && <div className="catalog-notice"><DemoNotice announcement={settings.announcement} /></div>}
      <SoftwareExplorer items={softwareItems} layout={settings.softwareLayout} />
      <div className="catalog-contact"><span>还没找到想要的工具？</span><a href="/contact">告诉我你的想法 <ArrowUpRight size={15} /></a></div>
    </main>
  );
}

