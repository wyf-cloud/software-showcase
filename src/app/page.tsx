import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Aperture, Code2, Sparkles } from "lucide-react";
import { ParticleField } from "@/components/particle-field";
import { ProductVisual } from "@/components/product-visual";
import { SoftwareLayout } from "@/components/software-layout";
import { Reveal } from "@/components/motion";
import { DemoNotice } from "@/components/demo-notice";
import { readSoftware } from "@/lib/software-settings";
import { readSiteSettings } from "@/lib/site-settings";

const disciplines = ["WEB APPS", "DESKTOP TOOLS", "LITTLE EXPERIMENTS"];

export default async function HomePage() {
  const settings = await readSiteSettings();
  const softwareItems = await readSoftware();
  return (
    <main>
      <section className="hero-section">
        <div className="hero-backdrop" />
        {settings.showParticles && <ParticleField />}
        <div className="page-shell hero-layout">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="live-dot" /> INDEPENDENT SOFTWARE · EST. 2026</div>
            <h1>{settings.heroTitle}<br /><em>{settings.heroHighlight}</em></h1>
            <p className="hero-description">{settings.heroDescription}</p>
            <div className="hero-actions">
              <Link href="/software" className="button button-dark">探索软件作品 <ArrowUpRight size={17} /></Link>
              <Link href="/about" className="text-link">认识开发者 <ArrowRight size={15} /></Link>
            </div>
            <div className="hero-meta"><span><i /> 持续创造中</span><span>效率 · 设计 · 日常</span></div>
          </div>
          <div className="hero-art-wrap">
            <div className="hero-orb orb-a" /><div className="hero-orb orb-b" />
            <div className="hero-product-window"><ProductVisual visual="dashboard" name="Tempo Board" /></div>
            <div className="hero-note-card"><span className="note-spark"><Sparkles size={14} /></span><div><b>小而美的工具</b><small>为每天节省一点心力</small></div><ArrowUpRight size={15} /></div>
            <div className="hero-stamp"><span>MADE WITH</span><b>✳</b><span>INTENTION</span></div>
            <div className="hero-folio">01 <span>/</span> 06</div>
          </div>
        </div>
        <div className="hero-bottom page-shell"><span>INDEPENDENTLY MADE, WITH CARE</span><span>向下探索 <ArrowDownRight size={14} /></span></div>
      </section>

      {settings.showDemoNotice && <div className="page-shell notice-wrap"><DemoNotice announcement={settings.announcement} /></div>}

      <section className="intro-strip page-shell">
        <div className="intro-index"><span>01</span><i /></div>
        <p>从一个小小的想法开始，<br /><strong>让日常体验变得更好一点。</strong></p>
        <div className="intro-aside">全部作品 <span>{String(softwareItems.length).padStart(2, "0")}</span></div>
      </section>

      <section className="section-block featured-section page-shell" id="projects">
        <div className="section-heading-row">
          <Reveal><div className="section-heading"><span className="eyebrow">ALL WORKS / 2024—2026</span><h2>全部作品<span className="heading-dot">.</span></h2><p>每个项目都从一个真实的小问题开始。</p></div></Reveal>
        </div>
        <SoftwareLayout items={softwareItems} layout={settings.softwareLayout} featured />
      </section>

      <section className="practice-band">
        <div className="page-shell practice-layout">
          <div className="practice-copy"><span className="eyebrow">A SMALL STUDIO OF ONE</span><h2>少一点复杂，<br /><span>多一点用心。</span></h2><p>我相信好的软件，不需要很吵。它只要在对的时刻出现，把一件事情做得顺手、舒服，然后悄悄融入生活。</p><Link href="/about" className="text-link text-link-light">关于创作的想法 <ArrowUpRight size={15} /></Link></div>
          <div className="practice-visual"><div className="practice-ring ring-outer" /><div className="practice-ring ring-inner" /><div className="practice-core"><Aperture size={35} strokeWidth={1.1} /><span>THOUGHTFULLY<br />CRAFTED</span></div><div className="practice-orbit-label label-one"><Code2 size={14} /> Build with care</div><div className="practice-orbit-label label-two"><Sparkles size={14} /> Stay curious</div><div className="practice-orbit-dot" /></div>
        </div>
      </section>

      <section className="section-block categories-section page-shell">
        <div className="section-heading-row"><div className="section-heading"><span className="eyebrow">A FEW THINGS I CARE ABOUT</span><h2>不同方向，<span className="heading-dot">同一份认真。</span></h2></div></div>
        <div className="discipline-list">{disciplines.map((item, index) => <Link href="/software" className="discipline-item" key={item}><span className="discipline-number">0{index + 1}</span><strong>{item}</strong><span className="discipline-aside">探索方向 <ArrowUpRight size={15} /></span></Link>)}</div>
      </section>

      <section className="closing-cta page-shell"><div className="cta-glow" /><div className="cta-content"><span className="eyebrow">HAVE SOMETHING IN MIND?</span><h2>一个好想法，<br /><em>值得被做出来。</em></h2><p>合作、建议，或只是想聊聊你的点子，欢迎来信。</p><Link href="/contact" className="button button-dark">打个招呼 <ArrowUpRight size={17} /></Link></div><div className="cta-decoration"><span>LET’S MAKE</span><b>✳</b><span>SOMETHING USEFUL</span></div></section>
    </main>
  );
}



