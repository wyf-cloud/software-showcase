import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, Download, Code2, Video } from "lucide-react";
import { notFound } from "next/navigation";
import { software } from "@/data/software";
import { ProductVisual } from "@/components/product-visual";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { Reveal } from "@/components/motion";
import { DemoNotice } from "@/components/demo-notice";
import { readSoftware } from "@/lib/software-settings";
import { readSiteSettings } from "@/lib/site-settings";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return software.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const items = await readSoftware();
  const item = items.find((candidate) => candidate.slug === slug);
  return item ? { title: item.name, description: item.description } : {};
}

export default async function SoftwareDetailPage({ params }: Props) {
  const { slug } = await params;
  const items = await readSoftware();
  const item = items.find((candidate) => candidate.slug === slug);
  if (!item) notFound();
  const settings = await readSiteSettings();
  const related = items.filter((candidate) => candidate.slug !== item.slug && candidate.category === item.category).slice(0, 2);
  const storyTitle = item.storyTitle || "把一个真实的问题，做成轻盈的答案。";
  const storyBody = item.storyBody || `${item.description} 它从日常使用中的细节出发，希望在不增加负担的前提下，给人更清晰、更舒服的体验。`;

  return (
    <main className="detail-page">
      <section className={`detail-hero art-bg-${item.accent}`}>
        <div className="detail-hero-glow" />
        <div className="page-shell">
          <Link href="/software" className="back-link"><ArrowLeft size={15} /> 返回作品列表</Link>
          <div className="detail-hero-grid">
            <div className="detail-intro">
              <div className="eyebrow"><span className="live-dot" /> {item.category}</div>
              <h1>{item.name}<br /><em>{item.tagline}</em></h1>
              <p>{item.description}</p>
              <div className="detail-actions">
                {item.demoUrl ? <a className="button button-dark" href={item.demoUrl} target="_blank" rel="noreferrer">演示视频 <Video size={15} /></a> : <span className="button button-dark is-disabled" aria-disabled="true" title="请先在后台填写演示视频链接"><Video size={15} /> 演示视频</span>}
                {item.downloadUrl ? <a className="button button-soft" href={item.downloadUrl} target="_blank" rel="noreferrer"><Download size={15} /> 获取应用</a> : <span className="button button-soft is-disabled"><Download size={15} /> 即将提供</span>}
              </div>
              {(item.documentationUrl || item.sourceUrl) && <div className="detail-secondary-links"><span>继续了解</span>{item.documentationUrl && <a href={item.documentationUrl} target="_blank" rel="noreferrer"><BookOpen size={14} /> 使用文档</a>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer"><Code2 size={14} /> 源代码</a>}</div>}
            </div>
            <div className="detail-art-wrap"><ProductVisual visual={item.visual} name={item.name} imageUrl={item.imageUrl} featured /></div>
          </div>
        </div>
      </section>
      {settings.showDemoNotice && <div className="page-shell detail-notice"><DemoNotice announcement={settings.announcement} /></div>}
      <section className="page-shell detail-info-grid">
        <div className="detail-meta-list"><div><span>版本</span><b>v{item.version}</b></div><div><span>最近更新</span><b>{item.updatedAt}</b></div></div>
        <div className="detail-story"><span className="eyebrow">THE IDEA BEHIND IT</span><h2>{storyTitle.split("，").map((part, index) => <span key={`${part}-${index}`}>{index > 0 && "，"}{index === storyTitle.split("，").length - 1 ? <em>{part}</em> : part}{index < storyTitle.split("，").length - 1 && <br />}</span>)}</h2><p>{storyBody}</p></div>
      </section>
      <section className="page-shell screenshots-section"><div className="section-heading-row"><div className="section-heading"><span className="eyebrow">A CLOSER LOOK</span><h2>在细节里，<span className="heading-dot">看见想法。</span></h2></div><span className="screenshot-count">{String(item.screenshots.length).padStart(2, "0")} / SCREENSHOTS</span></div><ScreenshotGallery items={item.screenshots} productName={item.name} /></section>
      {related.length > 0 && <section className="page-shell related-section"><div className="section-heading-row"><div className="section-heading"><span className="eyebrow">YOU MAY ALSO LIKE</span><h2>继续看看<span className="heading-dot">.</span></h2></div><Link href="/software" className="text-link">全部作品 <ArrowUpRight size={15} /></Link></div><div className="software-grid related-grid">{related.map((relatedItem, index) => <Reveal key={relatedItem.slug} delay={index * .08}><Link href={`/software/${relatedItem.slug}`} className="related-card"><ProductVisual visual={relatedItem.visual} name={relatedItem.name} imageUrl={relatedItem.imageUrl} compact /><div><span>{relatedItem.category}</span><h3>{relatedItem.name}</h3><p>{relatedItem.tagline}</p></div><ArrowUpRight size={16} /></Link></Reveal>)}</div></section>}
      <section className="detail-end page-shell"><span>THANKS FOR LOOKING</span><Link href="/contact" className="button button-dark">聊聊合作 <ArrowUpRight size={16} /></Link></section>
    </main>
  );
}
