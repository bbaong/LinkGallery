import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { linkApi } from "../api/linkApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { LinkFormValues } from "../schema/linkSchema";
import type { Link } from "../types";

export function useLinksQuery(folderId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.links.byFolder(folderId ?? ""),
    queryFn: () => linkApi.listByFolder(folderId!),
    enabled: Boolean(folderId),
  });
}

export function useRecentLinksQuery(limit = 12) {
  return useQuery({
    queryKey: queryKeys.links.recent(limit),
    queryFn: () => linkApi.listRecent(limit),
  });
}

export function useAllLinksQuery() {
  return useQuery({
    queryKey: queryKeys.links.all,
    queryFn: () => linkApi.listAll(),
  });
}

export function useVisitLinkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => linkApi.recordVisit(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["links", "recent"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all });
    },
  });
}

export function useReorderLinksMutation(folderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => linkApi.reorder(folderId, orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.links.byFolder(folderId) });
      const previous = queryClient.getQueryData<Link[]>(queryKeys.links.byFolder(folderId));
      if (previous) {
        const byId = new Map(previous.map((link) => [link.id, link]));
        queryClient.setQueryData(
          queryKeys.links.byFolder(folderId),
          orderedIds
            .map((id, position) => {
              const link = byId.get(id);
              return link ? { ...link, position } : null;
            })
            .filter((link): link is Link => Boolean(link))
        );
      }
      return { previous };
    },
    onError: (_error, _orderedIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.links.byFolder(folderId), context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.links.byFolder(folderId) }),
  });
}

function useInvalidateLinkRelated(folderId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["links", "folder", folderId] }),
      queryClient.invalidateQueries({ queryKey: ["links", "recent"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.detail(folderId) }),
    ]);
}

export function useCreateLinkMutation(folderId: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLinkRelated(folderId);
  return useMutation({
    mutationFn: (input: LinkFormValues) => linkApi.create(folderId, input),
    onSuccess: (created) => {
      queryClient.setQueryData<Link[]>(queryKeys.links.byFolder(folderId), (prev) => {
        if (!prev) return [created];
        if (prev.some((link) => link.id === created.id)) return prev;
        return [...prev, created];
      });
      return invalidate();
    },
  });
}

export function useUpdateLinkMutation(folderId: string) {
  const invalidate = useInvalidateLinkRelated(folderId);
  return useMutation({
    mutationFn: ({ linkId, input }: { linkId: string; input: Partial<LinkFormValues> }) =>
      linkApi.update(linkId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteLinkMutation(folderId: string) {
  const invalidate = useInvalidateLinkRelated(folderId);
  return useMutation({
    mutationFn: (linkId: string) => linkApi.remove(linkId),
    onSuccess: invalidate,
  });
}

const previewRefreshAttempted = new Set<string>();
let previewRefreshActive = 0;
const previewRefreshQueue: Array<() => void> = [];
const PREVIEW_REFRESH_LIMIT = 3;

function enqueuePreviewRefresh<T>(task: () => Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      previewRefreshActive += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          previewRefreshActive -= 1;
          previewRefreshQueue.shift()?.();
        });
    };
    if (previewRefreshActive < PREVIEW_REFRESH_LIMIT) run();
    else previewRefreshQueue.push(run);
  });
}

export function useRefreshLinkPreviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => enqueuePreviewRefresh(() => linkApi.refreshPreview(linkId)),
    onSuccess: (updated) => {
      queryClient.setQueryData<Link[]>(queryKeys.links.byFolder(updated.folderId), (prev) =>
        prev?.map((link) => (link.id === updated.id ? { ...link, previewImageUrl: updated.previewImageUrl } : link))
      );
    },
  });
}

export function shouldRefreshLinkPreview(link: Link) {
  return !link.previewImageUrl && !previewRefreshAttempted.has(link.id);
}

export function markLinkPreviewAttempted(linkId: string) {
  previewRefreshAttempted.add(linkId);
}
