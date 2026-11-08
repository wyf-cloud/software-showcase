import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/site-settings";
import { normalizeAdvertisements, readAdvertisements, writeAdvertisements } from "@/lib/advertisements";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expected = getAdminToken();
  return Boolean(expected) && request.headers.get("x-admin-token") === expected;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  return NextResponse.json(await readAdvertisements(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  try {
    const body: unknown = await request.json();
    const config = normalizeAdvertisements(body);
    return NextResponse.json(await writeAdvertisements(config), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "广告配置保存失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
