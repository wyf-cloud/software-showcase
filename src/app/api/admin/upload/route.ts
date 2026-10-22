export const dynamic = "force-dynamic";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/site-settings";

const acceptedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const maxSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const expected = getAdminToken();
  if (!expected || request.headers.get("x-admin-token") !== expected) {
    return NextResponse.json({ error: "管理员口令不正确" }, { status: 401 });
  }

  try {
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "请选择要上传的图片" }, { status: 400 });
    const extension = acceptedTypes[file.type];
    if (!extension) return NextResponse.json({ error: "支持 JPG、PNG、WebP、AVIF 或 GIF 图片" }, { status: 400 });
    if (file.size <= 0 || file.size > maxSize) return NextResponse.json({ error: "图片大小需在 1B 到 8MB 之间" }, { status: 400 });

    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片上传失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
