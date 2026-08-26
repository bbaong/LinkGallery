export type UploadKind = "folder-covers" | "avatars" | "banners";

export interface StoredImage {
  url: string;
  key: string;
}

export interface ImageStorageService {
  save(file: Express.Multer.File, kind?: UploadKind): Promise<StoredImage>;
  remove(key: string, kind?: UploadKind): Promise<void>;
}
