"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, X } from "lucide-react";
import type { Software } from "@/data/software";
import { ProductVisual } from "@/components/product-visual";

type Shot = Software["screenshots"][number];

export function ScreenshotGallery({ items, productName }: { items: Shot[]; productName: string }) {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") setActive((current) => current === null ? null : (current + 1) % items.length);
      if (event.key === "ArrowLeft") setActive((current) => current === null ? null : (current - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, items.length]);

  return (
    <>
      <div className="gallery-grid">
        {items.map((shot, index) => {
          const cardContent = (
            <>
              <div className={`gallery-art art-bg-${index === 1 ? "blue" : index === 2 ? "lilac" : "mint"}`}><ProductVisual visual={shot.visual} name={productName} imageUrl={shot.imageUrl} title={shot.title} caption={shot.caption} compact /></div>
              <span className="gallery-caption">
                <b>{shot.title}</b>
                <small>{shot.caption}</small>
                {shot.linkUrl && <span className="gallery-visit-label">打开网站 <ArrowUpRight size={13} /></span>}
              </span>
            </>
          );

          return (
            <article key={`${shot.title}-${index}`} className="gallery-card">
              {shot.linkUrl ? (
                <a className="gallery-item gallery-link-card" href={shot.linkUrl} target="_blank" rel="noopener noreferrer" aria-label={`打开${productName}相关网站：${shot.title}`}>
                  {cardContent}
                </a>
              ) : (
                <button type="button" className="gallery-item" onClick={() => setActive(index)} aria-label={`查看${productName}截图：${shot.title}`}>
                  {cardContent}
                </button>
              )}
              {shot.linkUrl && <button className="gallery-link gallery-preview-button" type="button" onClick={() => setActive(index)} aria-label={`预览${productName}截图：${shot.title}`}><Eye size={14} /> 查看截图</button>}
            </article>
          );
        })}
      </div>
      {active !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${productName}截图预览`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
          <button className="lightbox-close" type="button" onClick={() => setActive(null)} aria-label="关闭预览"><X /></button>
          <button className="lightbox-arrow previous" type="button" onClick={() => setActive((active - 1 + items.length) % items.length)} aria-label="上一张"><ArrowLeft /></button>
          <div className="lightbox-content">
            <div className={`lightbox-art art-bg-${active === 1 ? "blue" : active === 2 ? "lilac" : "mint"}`}><ProductVisual visual={items[active].visual} name={productName} imageUrl={items[active].imageUrl} title={items[active].title} caption={items[active].caption} /></div>
            <div className="lightbox-caption"><span>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><div><b>{items[active].title}</b><p>{items[active].caption}</p>{items[active].linkUrl && <a className="gallery-link" href={items[active].linkUrl} target="_blank" rel="noreferrer">打开相关内容 <ArrowUpRight size={14} /></a>}</div></div>
          </div>
          <button className="lightbox-arrow next" type="button" onClick={() => setActive((active + 1) % items.length)} aria-label="下一张"><ArrowRight /></button>
        </div>
      )}
    </>
  );
}


