import { NextResponse } from "next/server";
import path from "path";
import crypto from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";

import {
  deleteCloudinaryImage,
  hasCloudinaryConfig,
  tryParseCloudinaryPublicIdFromUrl,
  uploadImageBufferToCloudinary,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

const UPLOADS_BASE_URL = "/uploads";
const UPLOADS_BASE_DIR = path.join(process.cwd(), "public", "uploads");

function sanitizeFolder(folder: string) {
  const safe = folder.trim();
  if (!safe) return "products";
  if (!/^[a-zA-Z0-9_-]+$/.test(safe)) return "products";
  return safe;
}

function safeUnlinkIfLocalUpload(replacePath: string | null) {
  if (!replacePath) return Promise.resolve();
  if (!replacePath.startsWith(`${UPLOADS_BASE_URL}/`)) return Promise.resolve();
  if (replacePath.includes("..")) return Promise.resolve();

  const absolute = path.join(process.cwd(), "public", replacePath);
  if (!absolute.startsWith(UPLOADS_BASE_DIR)) return Promise.resolve();
  if (!existsSync(absolute)) return Promise.resolve();

  return unlink(absolute).catch(() => undefined);
}

async function safeDeleteIfCloudinaryUrl(replacePath: string | null) {
  if (!replacePath) return;
  if (!hasCloudinaryConfig()) return;

  // Only attempt deletion for Cloudinary URLs.
  if (!replacePath.startsWith("http://") && !replacePath.startsWith("https://")) {
    return;
  }

  const publicId = tryParseCloudinaryPublicIdFromUrl(replacePath);
  if (!publicId) return;

  await deleteCloudinaryImage(publicId).catch(() => undefined);
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const pathOrUrl = body?.path;

    if (typeof pathOrUrl !== "string" || !pathOrUrl) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    await Promise.all([
      safeUnlinkIfLocalUpload(pathOrUrl),
      safeDeleteIfCloudinaryUrl(pathOrUrl),
    ]);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Delete failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const folderRaw = formData.get("folder");
    const replacePath = formData.get("replacePath");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 },
      );
    }

    const folder = sanitizeFolder(
      typeof folderRaw === "string" ? folderRaw : "products",
    );

    const replacePathString = typeof replacePath === "string" ? replacePath : null;

    // Prefer Cloudinary when configured (cPanel-friendly; no filesystem writes).
    if (hasCloudinaryConfig()) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await uploadImageBufferToCloudinary({
        buffer,
        folder,
      });

      // Best-effort cleanup: if the previous image is local OR a Cloudinary URL.
      await Promise.all([
        safeUnlinkIfLocalUpload(replacePathString),
        safeDeleteIfCloudinaryUrl(replacePathString),
      ]);

      return NextResponse.json(
        { path: uploaded.secureUrl, publicId: uploaded.publicId },
        { status: 200 },
      );
    }

    // Fallback to local uploads when Cloudinary is not configured.
    const uploadDir = path.join(UPLOADS_BASE_DIR, folder);
    await mkdir(uploadDir, { recursive: true });

    const originalName = file.name || "upload";
    const ext = path.extname(originalName).slice(1).toLowerCase();
    const safeExt = ext && /^[a-z0-9]+$/.test(ext) ? ext : "jpg";

    const filename = `${Date.now()}-${crypto.randomUUID()}.${safeExt}`;
    const absolutePath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(absolutePath, new Uint8Array(bytes));

    await safeUnlinkIfLocalUpload(replacePathString);

    const publicPath = `${UPLOADS_BASE_URL}/${folder}/${filename}`;
    return NextResponse.json({ path: publicPath }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Upload failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
