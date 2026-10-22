import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "后台设置",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <main className="admin-page page-shell"><AdminDashboard /></main>;
}
