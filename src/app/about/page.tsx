import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Heart, Layers3, Mail, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion";
import { readSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSiteSettings();
  return {
    title: settings.aboutMetaTitle,
    description: settings.aboutDescription,
  };
}

export default async function AboutPage() {
  const settings = await readSiteSettings();
  const values = [
    { icon: <Sparkles />, title: settings.aboutValueOneTitle, text: settings.aboutValueOneText },
    { icon: <Layers3 />, title: settings.aboutValueTwoTitle, text: settings.aboutValueTwoText },
    { icon: <Heart />, title: settings.aboutValueThreeTitle, text: settings.aboutValueThreeText },
  ];

  return (
    <main className="simple-page page-shell">
      <div className="page-topline"><span>{settings.aboutTopline}</span><span>01 / 01 <i /></span></div>
      <section className="simple-hero">
        <div className="eyebrow"><span className="live-dot" /> {settings.aboutHeroEyebrow}</div>
        <h1>{settings.aboutTitleLead}<br /><em>{settings.aboutTitleHighlight}</em></h1>
        <p>{settings.aboutDescription}</p>
        <div className="simple-actions">
          <Link href="/software" className="button button-dark">{settings.aboutWorksLinkText} <ArrowUpRight size={16} /></Link>
          <a href={`mailto:${settings.contactEmail}`} className="text-link">{settings.aboutEmailLinkText} <Mail size={15} /></a>
        </div>
      </section>
      <section className="about-manifesto">
        <div className="manifesto-mark">✳</div>
        <div>
          <span className="eyebrow">{settings.aboutManifestoEyebrow}</span>
          <h2>{settings.aboutManifestoTitleLead}<br /><em>{settings.aboutManifestoTitleHighlight}</em></h2>
          <p>{settings.aboutManifestoDescription}</p>
        </div>
      </section>
      <section className="about-values">
        <div className="section-heading">
          <span className="eyebrow">{settings.aboutValuesEyebrow}</span>
          <h2>{settings.aboutValuesTitle}<span className="heading-dot">.</span></h2>
        </div>
        <div className="value-grid">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * .1}>
              <article className="value-card">
                <span className="value-icon">{value.icon}</span>
                <span className="feature-no">0{index + 1}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-signoff">
        <span className="eyebrow">{settings.aboutSignoffEyebrow}</span>
        <h2>{settings.aboutSignoffTitleLead}<br /><em>{settings.aboutSignoffTitleHighlight}</em></h2>
        <Link href="/contact" className="button button-dark">{settings.aboutContactButtonText} <ArrowUpRight size={16} /></Link>
      </section>
    </main>
  );
}

