"use client";

import { ArrowUpRight, Bell, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdPlacement, Advertisement } from "@/lib/advertisements";
import { withSiteBasePath } from "@/lib/site-path";

function AdLink({ ad, className, children }: { ad: Advertisement; className?: string; children: React.ReactNode }) {
  if (!ad.href) return <div className={className}>{children}</div>;
  if (/^https?:\/\//i.test(ad.href)) return <a className={className} href={ad.href} target="_blank" rel="noopener noreferrer">{children}</a>;
  return <Link className={className} href={ad.href}>{children}</Link>;
}

function deviceClass(ad: Advertisement) {
  return `ad-device-${ad.device}`;
}

function useActiveAds(ads: Advertisement[], placement: AdPlacement) {
  const [active, setActive] = useState<Advertisement[]>([]);
  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      const isMobile = window.matchMedia("(max-width: 680px)").matches;
      const next = ads.filter((ad) => {
        if (!ad.enabled || ad.placement !== placement) return false;
        const startsAt = ad.startsAt ? Date.parse(ad.startsAt) : Number.NEGATIVE_INFINITY;
        const endsAt = ad.endsAt ? Date.parse(ad.endsAt) : Number.POSITIVE_INFINITY;
        const deviceMatches = ad.device === "all" || (isMobile && ad.device === "mobile") || (!isMobile && ad.device === "desktop");
        return startsAt <= now && now < endsAt && deviceMatches;
      }).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
      setActive((current) => current.length === next.length && current.every((ad, index) => ad === next[index]) ? current : next);
    };
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("resize", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("resize", refresh); };
  }, [ads, placement]);
  return active;
}

export function GlobalAdvertisementSlots({ ads }: { ads: Advertisement[] }) {
  const announcements = useActiveAds(ads, "announcement");
  const popups = useActiveAds(ads, "popup");
  return <><AnnouncementBar ads={announcements} /><AdvertisementPopup ads={popups} /></>;
}

export function AnnouncementBar({ ads }: { ads: Advertisement[] }) {
  const visibleAds = ads.filter((ad) => ad.title || ad.text);
  if (!visibleAds.length) return null;
  const items = [...visibleAds, ...visibleAds];
  return (
    <div className="announcement-ad-bar" role="region" aria-label="站点广告公告">
      <div className="page-shell announcement-ad-inner">
        <span className="announcement-ad-label"><Bell size={13} aria-hidden="true" />广告</span>
        <div className="announcement-ad-marquee" aria-live="polite">
          <div className="announcement-ad-track">
            {items.map((ad, index) => (
              <AdLink key={`${ad.id}-${index}`} ad={ad} className={`announcement-ad-item ${deviceClass(ad)}`}>
                <strong>{ad.title}</strong><span>{ad.text}</span><ArrowUpRight size={13} aria-hidden="true" />
              </AdLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function localDateKey(timestamp: number) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function readDailyPopupCount(adId: string, today: string) {
  let count = 0;
  try {
    const raw = window.localStorage.getItem(`advertisement-popup-count:${adId}`);
    if (raw) {
      const saved = JSON.parse(raw) as { date?: unknown; count?: unknown };
      if (saved.date === today && typeof saved.count === "number" && Number.isInteger(saved.count) && saved.count >= 0) count = saved.count;
    }
  } catch { /* The in-memory limit still applies when storage is unavailable. */ }
  try {
    const legacyClosedAt = Number(window.localStorage.getItem(`advertisement-popup:${adId}`) || "0");
    if (legacyClosedAt > 0 && localDateKey(legacyClosedAt) === today) count = Math.max(count, 1);
  } catch { /* Ignore legacy storage when unavailable. */ }
  return count;
}

function writeDailyPopupCount(adId: string, today: string, count: number) {
  try { window.localStorage.setItem(`advertisement-popup-count:${adId}`, JSON.stringify({ date: today, count })); }
  catch { /* The in-memory limit still applies when storage is unavailable. */ }
}

export function AdvertisementPopup({ ads }: { ads: Advertisement[] }) {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [ad, setAd] = useState<Advertisement | null>(null);
  const candidates = useMemo(() => ads.filter((item) => item.title || item.text), [ads]);
  const shownThisOpen = useRef(false);
  const dailyCountThisOpen = useRef(new Map<string, number>());
  const closePopup = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!candidates.length || open || shownThisOpen.current) return;
    const isMobile = window.matchMedia("(max-width: 680px)").matches;
    const today = localDateKey(Date.now());
    const selected = candidates.find((item) => {
      const deviceMatches = item.device === "all" || (isMobile && item.device === "mobile") || (!isMobile && item.device === "desktop");
      if (!deviceMatches) return false;
      if (item.popupFrequency === "every-open") return true;
      const count = Math.max(readDailyPopupCount(item.id, today), dailyCountThisOpen.current.get(item.id) || 0);
      return count < item.popupDailyLimit;
    });
    if (!selected) return;
    const timer = window.setTimeout(() => {
      const displayDate = localDateKey(Date.now());
      if (selected.popupFrequency === "daily-limit") {
        const count = Math.max(readDailyPopupCount(selected.id, displayDate), dailyCountThisOpen.current.get(selected.id) || 0);
        if (count >= selected.popupDailyLimit) return;
        const nextCount = count + 1;
        dailyCountThisOpen.current.set(selected.id, nextCount);
        writeDailyPopupCount(selected.id, displayDate, nextCount);
      }
      shownThisOpen.current = true;
      setAd(selected);
      setOpen(true);
    }, selected.popupDelaySeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [candidates, open]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closePopup(); return; }
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>(".advertisement-popup");
      const focusable = dialog ? [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')] : [];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [open, closePopup]);

  if (!open || !ad) return null;
  return (
    <div className="advertisement-popup-backdrop" role="presentation">
      <section className={`advertisement-popup ${deviceClass(ad)}`} role="dialog" aria-modal="true" aria-labelledby="advertisement-popup-title">
        <button ref={closeButton} className="advertisement-popup-close" type="button" onClick={closePopup} aria-label="关闭广告"><X size={18} /></button>
        {ad.imageUrl && <Image unoptimized width={1200} height={800} src={withSiteBasePath(ad.imageUrl)} alt="" className="advertisement-popup-image" />}
        <div className="advertisement-popup-copy">
          <span className="eyebrow">SPONSORED</span>
          <h2 id="advertisement-popup-title">{ad.title}</h2>
          <p>{ad.text}</p>
          {ad.href && ad.buttonText && <AdLink ad={ad} className="button button-dark">{ad.buttonText}<ArrowUpRight size={15} /></AdLink>}
        </div>
      </section>
    </div>
  );
}

export function AdvertisementBanner({ ads }: { ads: Advertisement[] }) {
  const activeAds = useActiveAds(ads, "home-mid");
  if (!activeAds.length) return null;
  return (
    <section className="advertisement-banner page-shell" aria-label="首页推广广告">
      {activeAds.map((ad) => (
        <AdLink key={ad.id} ad={ad} className={`advertisement-banner-card ${deviceClass(ad)}`}>
          {ad.imageUrl && <Image unoptimized width={1200} height={800} src={withSiteBasePath(ad.imageUrl)} alt="" className="advertisement-banner-image" />}
          <span className="advertisement-banner-copy"><span className="eyebrow">SPONSORED</span><strong>{ad.title}</strong><span>{ad.text}</span></span>
          {ad.buttonText && <span className="advertisement-banner-action">{ad.buttonText}<ArrowUpRight size={15} /></span>}
        </AdLink>
      ))}
    </section>
  );
}
