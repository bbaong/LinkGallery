export interface StoredImage {
  url: string;
  key: string;
}

export interface ImageStorageService {
  save(file: Express.Multer.File): Promise<StoredImage>;
  remove(key: string): Promise<void>;
}
