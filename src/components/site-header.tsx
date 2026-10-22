"use client";

import { LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { SiteSettings } from "@/lib/site-settings";

const links = [
  { href: "/software", label: "软件作品" },
  { href: "/about", label: "关于我" },
  { href: "/contact", label: "联系" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="nav-shell page-shell">
        <Link href="/" className="brand" aria-label={`回到${settings.siteName}首页`} onClick={closeMenu}>
          <span className="brand-mark"><span /></span>
          <span className="brand-word"><span>{settings.siteName}</span><small>{settings.brandSubtitle}</small></span>
        </Link>

        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="主导航">
          <Link className={`nav-link ${pathname === "/" ? "active" : ""}`} href="/" onClick={closeMenu}>首页</Link>
          {links.map((link) => (
            <Link key={link.href} className={`nav-link ${pathname.startsWith(link.href) ? "active" : ""}`} href={link.href} onClick={closeMenu}>
              {link.label}
            </Link>
          ))}
          {!pathname.startsWith("/admin") && (
            <Link href="/admin" className="nav-admin-link" onClick={closeMenu}>
              <LogIn size={15} aria-hidden="true" />后台登录
            </Link>
          )}
          <Link href="/contact" className="nav-cta" onClick={closeMenu}>聊聊合作 <span aria-hidden="true">↗</span></Link>
          <div className="mobile-theme"><ThemeToggle defaultTheme={settings.defaultTheme} /></div>
        </nav>

        <div className="nav-tools">
          <ThemeToggle defaultTheme={settings.defaultTheme} />
          <button className="menu-toggle" type="button" aria-label={open ? "关闭菜单" : "打开菜单"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

