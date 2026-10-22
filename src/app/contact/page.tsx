import Image from "next/image";
import type { Metadata } from "next";
import { ArrowUpRight, Mail, MessageCircle, MoveUpRight, Send, ScanLine, Sparkles } from "lucide-react";
import { readSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "联系", description: "联系工作室，聊聊合作、反馈或下一个软件想法。" };

export default async function ContactPage() {
  const settings = await readSiteSettings();

  return (
    <main className="contact-page page-shell">
      <div className="page-topline"><span>LET’S CONNECT</span><span>OPEN FOR GOOD IDEAS <i /></span></div>
      <section className="contact-hero-layout">
        <div className="contact-hero">
          <div className="eyebrow"><span className="live-dot" /> SAY HELLO</div>
          <h1>有想法，<br /><em>就说出来。</em></h1>
          <p>合作、反馈，或者只是想分享一个你觉得值得解决的小问题，都欢迎来信。</p>
          <a href={`mailto:${settings.contactEmail}`} className="contact-email">{settings.contactEmail} <ArrowUpRight size={20} /></a>
        </div>

        <aside className="qr-showcase" aria-label="微信好友二维码">
          <div className="qr-orbit qr-orbit-one" />
          <div className="qr-orbit qr-orbit-two" />
          <span className="qr-orbit-spark qr-orbit-spark-one"><Sparkles size={15} /></span>
          <span className="qr-orbit-spark qr-orbit-spark-two"><i /></span>
          <div className="qr-stage">
            <div className="qr-card">
              <div className="qr-card-topline">
                <span className="qr-live"><i /> ONLINE / WECHAT</span>
                <span className="qr-index">01 — 01</span>
              </div>
              <div className="qr-card-heading">
                <div><span className="eyebrow">A LITTLE HELLO, A LOT OF IDEAS</span><h2>扫一扫加好友<span>↗</span></h2></div>
                <span className="qr-scan-icon"><ScanLine size={17} /></span>
              </div>
              <div className="qr-image-frame">
                <span className="qr-corner qr-corner-tl" />
                <span className="qr-corner qr-corner-tr" />
                <span className="qr-corner qr-corner-bl" />
                <span className="qr-corner qr-corner-br" />
                <div className="qr-scan-line" />
                <Image
                  src="/images/wechat-contact-qr.jpg"
                  alt="微信好友二维码，扫一扫添加好友"
                  width={691}
                  height={695}
                  sizes="(max-width: 680px) 250px, 290px"
                  className="qr-image"
                  priority
                />
                <span className="qr-image-shine" />
              </div>
              <div className="qr-card-footer">
                <div><strong>扫一扫，加好友</strong><span>打开微信扫一扫，保持联系。</span></div>
                <span className="qr-arrow"><MoveUpRight size={18} /></span>
              </div>
              <div className="qr-card-bottomline"><span>GOOD THINGS START WITH HELLO</span><span>微信 · FRIENDS</span></div>
            </div>
          </div>
          <div className="qr-float-note"><span className="qr-note-icon"><MessageCircle size={15} /></span><span><b>随时欢迎来聊聊</b><small>IDEAS, FEEDBACK & MORE</small></span><ArrowUpRight size={14} /></div>
        </aside>
      </section>

      <section className="contact-options">
        <a href={`mailto:${settings.contactEmail}?subject=合作咨询`} className="contact-option"><span className="contact-option-icon"><Mail /></span><div><span className="eyebrow">合作 / COLLABORATION</span><h2>一起做点有意思的事</h2><p>如果你有项目、产品或设计合作想法，欢迎简单介绍一下。</p></div><ArrowUpRight size={18} /></a>
        <a href={`mailto:${settings.contactEmail}?subject=产品反馈`} className="contact-option"><span className="contact-option-icon"><MessageCircle /></span><div><span className="eyebrow">反馈 / FEEDBACK</span><h2>告诉我你的使用感受</h2><p>每一条真实反馈，都会帮助这些小软件变得更好。</p></div><ArrowUpRight size={18} /></a>
      </section>
      <section className="contact-bottom">
        <div><span className="eyebrow">FIND ME ELSEWHERE</span><div className="contact-links"><a href={settings.githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a><a href={settings.instagramUrl} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={14} /></a></div></div>
        <div className="contact-mark"><Send size={21} /><span>会尽快<br />回复你。</span></div>
      </section>
    </main>
  );
}


