import Link from "next/link";
import { ArrowUpRight, AtSign, Camera, Mail } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="page-shell footer-top">
        <div>
          <Link href="/" className="brand footer-brand"><span className="brand-mark"><span /></span><span className="brand-word"><span>{settings.siteName}</span><small>{settings.brandSubtitle}</small></span></Link>
          <p>{settings.siteDescription}<br />把想法做成真正好用的软件。</p>
        </div>
        <div className="footer-note"><span className="eyebrow">HAVE A GOOD IDEA?</span><Link href="/contact" className="footer-contact">一起做点有意思的事 <ArrowUpRight size={16} /></Link></div>
      </div>
      <div className="page-shell footer-bottom"><span>© {year} {settings.siteName} studio</span><span>用心构思 · 持续打磨 <span className="footer-heart">✳</span></span><div className="footer-socials"><a href={`mailto:${settings.contactEmail}`} aria-label="发送邮件"><Mail size={15} /></a><a href={settings.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub"><AtSign size={15} /></a><a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={15} /></a></div></div>
    </footer>
  );
}
