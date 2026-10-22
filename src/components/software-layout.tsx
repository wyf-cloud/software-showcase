"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Layers2 } from "lucide-react";
import type { Software } from "@/data/software";
import type { SoftwareLayout as SoftwareLayoutType } from "@/lib/software-layout";
import { SoftwareCard } from "@/components/software-card";
import { Reveal } from "@/components/motion";

type SoftwareLayoutProps = {
  items: Software[];
  layout: SoftwareLayoutType;
  featured?: boolean;
};

type LayoutItemStyle = CSSProperties & {
  "--layout-index": number;
  "--radial-x"?: string;
  "--radial-y"?: string;
};

export function SoftwareLayout({ items, layout, featured = false }: SoftwareLayoutProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  function updateActiveIndex() {
    const scrollNode = scrollRef.current;
    if (!scrollNode || !itemRefs.current.length) return;
    const center = scrollNode.scrollLeft + scrollNode.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const itemCenter = item.offsetLeft + item.clientWidth / 2;
      const distance = Math.abs(itemCenter - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveIndex(nearestIndex);
  }

  function moveCoverflow(direction: -1 | 1) {
    const nextIndex = Math.max(0, Math.min(items.length - 1, activeIndex + direction));
    setActiveIndex(nextIndex);
    const scrollNode = scrollRef.current;
    const target = itemRefs.current[nextIndex];
    if (scrollNode && target) {
      scrollNode.scrollTo({
        left: target.offsetLeft - (scrollNode.clientWidth - target.clientWidth) / 2,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className={`software-layout-frame software-layout-frame-${layout}`}>
      {layout === "stacked" && (
        <button type="button" className="layout-control stacked-toggle" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          <Layers2 size={15} /> {expanded ? "收起叠影" : `展开浏览 · ${items.length} 个作品`}
        </button>
      )}
      {layout === "coverflow" && items.length > 1 && (
        <div className="coverflow-controls" aria-label="3D 画廊导航">
          <button type="button" className="layout-control" aria-label="上一个作品" disabled={activeIndex === 0} onClick={() => moveCoverflow(-1)}><ArrowLeft size={16} /></button>
          <span>{String(activeIndex + 1).padStart(2, "0")} <i>/</i> {String(items.length).padStart(2, "0")}</span>
          <button type="button" className="layout-control" aria-label="下一个作品" disabled={activeIndex >= items.length - 1} onClick={() => moveCoverflow(1)}><ArrowRight size={16} /></button>
        </div>
      )}
      {layout === "radial" && (
        <div className="radial-center" aria-hidden="true">
          <span className="radial-center-orbit" />
          <span className="radial-center-mark">✳</span>
          <span className="radial-center-label">作品宇宙</span>
        </div>
      )}
      <div
        ref={scrollRef}
        className={`software-grid software-layout software-layout-${layout} ${featured ? "featured-grid" : ""} ${expanded ? "is-expanded" : ""}`}
        aria-label="软件作品"
        onScroll={layout === "coverflow" ? updateActiveIndex : undefined}
      >
        {items.map((item, index) => {
          const angle = (-90 + (360 * index) / Math.max(items.length, 1)) * Math.PI / 180;
          const style: LayoutItemStyle = {
            "--layout-index": index,
            ...(layout === "radial" ? {
              "--radial-x": `${50 + Math.cos(angle) * 39}%`,
              "--radial-y": `${50 + Math.sin(angle) * 36}%`,
            } : {}),
          };
          return (
            <div
              key={item.slug}
              ref={(element) => { itemRefs.current[index] = element; }}
              className={`software-layout-item ${layout === "bento" && index === 0 ? "is-bento-lead" : ""}`}
              style={style}
            >
              <Reveal delay={index * 0.055} className="software-layout-reveal">
                <SoftwareCard item={item} index={index} featured={featured} />
              </Reveal>
            </div>
          );
        })}
      </div>
    </div>
  );
}
