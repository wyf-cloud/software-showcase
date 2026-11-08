import type { Metadata } from "next";
import { AdsAdminDashboard } from "@/components/ads-admin-dashboard";

export const metadata: Metadata = { title: "广告管理", robots: { index: false, follow: false } };

export default function AdminAdsPage() {
  return <main className="admin-page page-shell"><AdsAdminDashboard /></main>;
}
