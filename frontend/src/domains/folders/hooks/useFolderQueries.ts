import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { folderApi } from "../api/folderApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { FolderFormValues } from "../schema/folderSchema";

export function useFoldersQuery() {
  return useQuery({
    queryKey: queryKeys.folders.all,
    queryFn: folderApi.list,
  });
}

export function useFolderQuery(folderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.folders.detail(folderId ?? ""),
    queryFn: () => folderApi.get(folderId!),
    enabled: Boolean(folderId),
    retry: false,
  });
}

export function useCreateFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FolderFormValues) => folderApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useUpdateFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, input }: { folderId: string; input: Partial<FolderFormValues> }) =>
      folderApi.update(folderId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(variables.folderId) });
    },
  });
}

export function useDeleteFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => folderApi.remove(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
    },
  });
}

export function useUploadFolderCoverMutation() {
  return useMutation({
    mutationFn: (file: File) => folderApi.uploadCover(file),
  });
}
