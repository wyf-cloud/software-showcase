import Link from "next/link";
import { ArrowUpRight, MoveUpRight } from "lucide-react";
import type { Software } from "@/data/software";
import { ProductVisual } from "@/components/product-visual";

export function SoftwareCard({ item, index = 0, featured = false }: { item: Software; index?: number; featured?: boolean }) {
  return (
    <Link href={`/software/${item.slug}`} className={`software-card ${featured ? "featured-card" : ""}`} style={{ "--card-index": index } as React.CSSProperties}>
      <div className={`card-art art-bg-${item.accent}`}>
        <ProductVisual visual={item.visual} name={item.name} imageUrl={item.imageUrl} compact />
        <span className="card-category">{item.category}</span>
        <span className="card-open" aria-hidden="true"><ArrowUpRight size={17} /></span>
      </div>
      <div className="card-content">
        <div className="card-heading"><h3>{item.name}</h3><span className="card-version">v{item.version}</span></div>
        <p>{item.tagline}</p>
        <div className="card-bottom"><div className="tag-list">{item.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div><span className="card-arrow"><MoveUpRight size={16} /></span></div>
      </div>
    </Link>
  );
}

