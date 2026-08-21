import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import type { ImageStorageService, StoredImage } from "./ImageStorageService";

const FOLDER_COVER_DIR = path.join(process.cwd(), env.UPLOAD_DIR, "folder-covers");

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

async function ensureDir() {
  await fs.mkdir(FOLDER_COVER_DIR, { recursive: true });
}

export const localImageStorageService: ImageStorageService = {
  async save(file): Promise<StoredImage> {
    await ensureDir();

    const extension = EXTENSION_BY_MIME[file.mimetype];
    if (!extension) {
      throw new Error(`지원하지 않는 이미지 형식입니다: ${file.mimetype}`);
    }

    const key = `${randomUUID()}${extension}`;
    const destination = path.join(FOLDER_COVER_DIR, key);

    await fs.writeFile(destination, file.buffer);

    return { key, url: `/uploads/folder-covers/${key}` };
  },

  async remove(key): Promise<void> {
    const safeKey = path.basename(key);
    const target = path.join(FOLDER_COVER_DIR, safeKey);
    try {
      await fs.unlink(target);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  },
};
