import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import type { ImageStorageService, StoredImage, UploadKind } from "./ImageStorageService";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function dirFor(kind: UploadKind) {
  return path.join(process.cwd(), env.UPLOAD_DIR, kind);
}

async function ensureDir(kind: UploadKind) {
  await fs.mkdir(dirFor(kind), { recursive: true });
}

export const localImageStorageService: ImageStorageService = {
  async save(file, kind = "folder-covers"): Promise<StoredImage> {
    await ensureDir(kind);

    const extension = EXTENSION_BY_MIME[file.mimetype];
    if (!extension) {
      throw new Error(`지원하지 않는 이미지 형식입니다: ${file.mimetype}`);
    }

    const key = `${randomUUID()}${extension}`;
    const destination = path.join(dirFor(kind), key);

    await fs.writeFile(destination, file.buffer);

    return { key, url: `/uploads/${kind}/${key}` };
  },

  async remove(key, kind = "folder-covers"): Promise<void> {
    const safeKey = path.basename(key);
    const target = path.join(dirFor(kind), safeKey);
    try {
      await fs.unlink(target);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  },
};
