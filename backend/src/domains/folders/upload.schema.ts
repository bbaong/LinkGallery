import { z } from "zod";

export const deleteFolderCoverSchema = z.object({
  url: z.string().trim().min(1, "삭제할 이미지 URL이 필요합니다."),
});

export type DeleteFolderCoverInput = z.infer<typeof deleteFolderCoverSchema>;
