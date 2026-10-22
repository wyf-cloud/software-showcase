"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Software } from "@/data/software";
import { SoftwareLayout } from "@/components/software-layout";
import type { SoftwareLayout as SoftwareLayoutType } from "@/lib/software-layout";

export function SoftwareExplorer({ items, layout }: { items: Software[]; layout: SoftwareLayoutType }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部作品");
  const [sort, setSort] = useState("featured");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => ["全部作品", ...Array.from(new Set(items.map((item) => item.category))).sort()], [items]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const result = items.filter((item) => {
      const matchesQuery = !normalized || [item.name, item.tagline, item.description, item.category].join(" ").toLocaleLowerCase().includes(normalized);
      const matchesCategory = category === "全部作品" || item.category === category;
      return matchesQuery && matchesCategory;
    });
    if (sort === "updated") result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") result.sort((a, b) => Number(b.featured) - Number(a.featured) || b.updatedAt.localeCompare(a.updatedAt));
    return result;
  }, [category, items, query, sort]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  const clear = () => { setQuery(""); setCategory("全部作品"); setSort("featured"); };
  const hasFilters = Boolean(query || category !== "全部作品");

  return (
    <section className="explorer" aria-label="软件作品浏览器">
      <div className="explorer-search-row">
        <label className="search-box"><Search size={18} /><span className="sr-only">搜索软件作品</span><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索软件、功能或关键词…" /><kbd>⌘ K</kbd></label>
        <label className="sort-select"><SlidersHorizontal size={16} /><span className="sr-only">作品排序</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">推荐排序</option><option value="updated">最近更新</option><option value="name">按名称排序</option></select></label>
      </div>
      <div className="filter-toolbar">
        <div className="category-filters" role="group" aria-label="按分类筛选">{categories.map((value) => <button type="button" key={value} className={`filter-chip ${category === value ? "selected" : ""}`} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div>
      </div>
      <div className="results-heading"><p aria-live="polite">找到 <strong>{filtered.length}</strong> 个作品</p>{hasFilters && <button type="button" className="clear-filters" onClick={clear}>清除筛选 <X size={13} /></button>}</div>
      {filtered.length ? <SoftwareLayout items={filtered} layout={layout} /> : <div className="empty-results"><span className="empty-icon"><Search size={20} /></span><h3>没有找到匹配的作品</h3><p>试试其他关键词，或清除筛选条件重新浏览。</p><button className="button button-dark" type="button" onClick={clear}>查看全部作品</button></div>}
    </section>
  );
}

