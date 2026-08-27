import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
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

export function useFolderInviteQuery(folderId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.folders.invite(folderId ?? ""),
    queryFn: () => folderApi.getInvite(folderId!),
    enabled: Boolean(folderId) && enabled,
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

export function useJoinFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => folderApi.join(code),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(result.folder.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.links.byFolder(result.folder.id) });
    },
  });
}

function invalidateFolderInvite(queryClient: QueryClient, folderId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.folders.invite(folderId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(folderId) });
}

export function useCreateFolderInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => folderApi.getOrCreateInvite(folderId),
    onSuccess: (_data, folderId) => {
      invalidateFolderInvite(queryClient, folderId);
    },
  });
}

export function useRegenerateFolderInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => folderApi.regenerateInvite(folderId),
    onSuccess: (_data, folderId) => {
      invalidateFolderInvite(queryClient, folderId);
    },
  });
}

export function useRevokeFolderInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => folderApi.revokeInvite(folderId),
    onSuccess: (_data, folderId) => {
      invalidateFolderInvite(queryClient, folderId);
    },
  });
}

function invalidateFolderMembership(queryClient: QueryClient, folderId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(folderId) });
  queryClient.invalidateQueries({ queryKey: ["links"] });
}

export function useRemoveFolderMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, userId }: { folderId: string; userId: string }) =>
      folderApi.removeMember(folderId, userId),
    onSuccess: (_data, variables) => {
      invalidateFolderMembership(queryClient, variables.folderId);
    },
  });
}

export function useLeaveFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => folderApi.leave(folderId),
    onSuccess: (_data, folderId) => {
      queryClient.removeQueries({ queryKey: queryKeys.folders.detail(folderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}
