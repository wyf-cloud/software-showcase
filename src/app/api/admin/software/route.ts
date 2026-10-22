export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/site-settings";
import { readSoftware, writeSoftware } from "@/lib/software-settings";

function authorized(request: Request) {
  const expected = getAdminToken();
  return Boolean(expected) && request.headers.get("x-admin-token") === expected;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  return NextResponse.json(await readSoftware(), { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  try {
    const items = await writeSoftware(await request.json());
    return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "作品保存失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
