import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MotionProvider } from "@/components/motion";
import { readSiteSettings } from "@/lib/site-settings";
import "./globals.css";
import "./visual-refresh.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSiteSettings();
  return {
    metadataBase: new URL("https://littleworks.example"),
    title: { default: `${settings.siteName} — 独立软件作品集`, template: `%s — ${settings.siteName}` },
    description: settings.siteDescription,
    applicationName: settings.siteName,
    openGraph: {
      title: `${settings.siteName} — 独立软件作品集`,
      description: settings.siteDescription,
      siteName: settings.siteName,
      locale: "zh_CN",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const settings = await readSiteSettings();
  const style = {
    "--site-primary": settings.primaryColor,
    "--site-accent": settings.accentColor,
  } as CSSProperties;

  return (
    <html lang="zh-CN" data-theme={settings.defaultTheme} style={style}>
      <body>
        <MotionProvider>
          <SiteHeader settings={settings} />
          {children}
          <SiteFooter settings={settings} />
        </MotionProvider>
      </body>
    </html>
  );
}

