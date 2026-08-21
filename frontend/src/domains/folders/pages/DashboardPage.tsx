import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Plus, Search, FolderHeart } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Logo } from "../../../shared/ui/Logo";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { Spinner } from "../../../shared/ui/Spinner";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { ApiRequestError } from "../../../shared/api/client";
import { APP_NAME } from "../../../shared/constants/app";
import { UserMenu } from "../../auth/components/UserMenu";
import { useAuthStore } from "../../auth/store/authStore";
import { useAllLinksQuery, useRecentLinksQuery } from "../../links/hooks/useLinkQueries";
import { RecentLinkCard } from "../../links/components/RecentLinkCard";
import { QuickLaunchItem } from "../../links/components/QuickLaunchItem";
import { QuickLaunchEditModal } from "../../links/components/QuickLaunchEditModal";
import { loadQuickLaunchIds, saveQuickLaunchIds } from "../../links/lib/quickLaunch";
import { FolderCard } from "../components/FolderCard";
import { FolderFormModal } from "../components/FolderFormModal";
import { DashboardHero } from "../components/DashboardHero";
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useFoldersQuery,
  useUpdateFolderMutation,
} from "../hooks/useFolderQueries";
import type { Folder } from "../types";
import type { FolderFormValues } from "../schema/folderSchema";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [isQuickLaunchOpen, setIsQuickLaunchOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[] | null>(null);

  const foldersQuery = useFoldersQuery();
  const recentLinksQuery = useRecentLinksQuery(12);
  const allLinksQuery = useAllLinksQuery();
  const createFolderMutation = useCreateFolderMutation();
  const updateFolderMutation = useUpdateFolderMutation();
  const deleteFolderMutation = useDeleteFolderMutation();

  const folders = foldersQuery.data ?? [];
  const recentLinks = recentLinksQuery.data ?? [];
  const allLinks = allLinksQuery.data ?? [];

  useEffect(() => {
    if (!user?.id) return;
    setPinnedIds(loadQuickLaunchIds(user.id));
  }, [user?.id]);

  const filteredFolders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return folders;
    return folders.filter((folder) => folder.name.toLowerCase().includes(keyword));
  }, [folders, search]);

  const quickLaunchLinks = useMemo(() => {
    const byId = new Map(allLinks.map((link) => [link.id, link]));
    if (pinnedIds && pinnedIds.length > 0) {
      return pinnedIds.map((id) => byId.get(id)).filter((link): link is NonNullable<typeof link> => Boolean(link));
    }
    if (pinnedIds && pinnedIds.length === 0) return [];
    return recentLinks.slice(0, 6);
  }, [allLinks, pinnedIds, recentLinks]);

  const quickLaunchSelectedIds = pinnedIds ?? recentLinks.slice(0, 6).map((link) => link.id);

  async function handleCreateFolder(values: FolderFormValues) {
    try {
      await createFolderMutation.mutateAsync(values);
      toast.success("폴더가 생성되었습니다.");
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "폴더 생성에 실패했습니다.";
      toast.error(message);
    }
  }

  async function handleUpdateFolder(values: FolderFormValues) {
    if (!editingFolder) return;
    setIsEditSubmitting(true);
    try {
      await updateFolderMutation.mutateAsync({ folderId: editingFolder.id, input: values });
      toast.success("폴더가 수정되었습니다.");
      setEditingFolder(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "폴더 수정에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsEditSubmitting(false);
    }
  }

  async function handleDeleteFolder() {
    if (!deletingFolder) return;
    try {
      await deleteFolderMutation.mutateAsync(deletingFolder.id);
      toast.success("폴더가 삭제되었습니다.");
      setDeletingFolder(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "폴더 삭제에 실패했습니다.";
      toast.error(message);
    }
  }

  function handleSaveQuickLaunch(ids: string[]) {
    if (!user?.id) return;
    saveQuickLaunchIds(user.id, ids);
    setPinnedIds(ids);
    toast.success("빠른 실행을 저장했습니다.");
  }

  const visibleRecent = showAllRecent ? recentLinks : recentLinks.slice(0, 5);

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="border-b border-line bg-canvas/80 backdrop-blur">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo />
          <UserMenu />
        </PageContainer>
      </header>

      <PageContainer className="flex flex-col gap-10 pt-8">
        <DashboardHero
          nickname={user?.nickname ?? ""}
          folders={folders}
          onCreateFolder={() => setIsCreateOpen(true)}
        />

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">최근 접속한 사이트</h2>
            {recentLinks.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowAllRecent((current) => !current)}
                className="inline-flex items-center text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {showAllRecent ? "접기" : "전체 보기"}
                <ChevronRight className={`h-4 w-4 ${showAllRecent ? "rotate-90" : ""}`} />
              </button>
            ) : null}
          </div>
          {recentLinks.length > 0 ? (
            showAllRecent ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {visibleRecent.map((link) => (
                  <RecentLinkCard key={link.id} link={link} className="w-full" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {visibleRecent.map((link) => (
                  <RecentLinkCard key={link.id} link={link} />
                ))}
              </div>
            )
          ) : (
            <div className="flex min-h-[7.25rem] items-center rounded-2xl border border-dashed border-line px-5">
              <p className="text-sm text-ink-soft">아직 기록이 없습니다</p>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">빠른 실행</h2>
            <button
              type="button"
              onClick={() => setIsQuickLaunchOpen(true)}
              className="inline-flex items-center text-sm text-ink-soft transition-colors hover:text-ink"
            >
              편집
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {quickLaunchLinks.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {quickLaunchLinks.map((link) => (
                <QuickLaunchItem key={link.id} link={link} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[4.5rem] items-center justify-between gap-3 rounded-2xl border border-dashed border-line px-5">
              <p className="text-sm text-ink-soft">자주 여는 사이트를 여기에 모아 두세요.</p>
              <Button variant="secondary" size="sm" onClick={() => setIsQuickLaunchOpen(true)}>
                추가
              </Button>
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-ink">내 폴더</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="폴더 검색"
                  className="w-full pl-10 sm:w-56"
                  aria-label="폴더 검색"
                />
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                새 폴더
              </Button>
            </div>
          </div>

          {foldersQuery.isLoading ? (
            <Spinner label="폴더를 불러오는 중..." />
          ) : filteredFolders.length === 0 ? (
            search ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="검색 결과가 없어요"
                description={`'${search}'와 일치하는 폴더를 찾을 수 없습니다.`}
              />
            ) : (
              <EmptyState
                icon={<FolderHeart className="h-8 w-8" />}
                title="아직 폴더가 없어요"
                description="새 폴더를 만들고 좋아하는 링크를 모아보세요."
                action={
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    첫 폴더 만들기
                  </Button>
                }
              />
            )
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              {filteredFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onEdit={setEditingFolder}
                  onDelete={setDeletingFolder}
                />
              ))}
            </div>
          )}
        </section>
      </PageContainer>

      <footer className="mt-16 text-center text-sm text-ink-soft">
        {APP_NAME} — 나만의 시작 페이지
      </footer>

      <FolderFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateFolder}
        isSubmitting={createFolderMutation.isPending}
      />

      <FolderFormModal
        open={Boolean(editingFolder)}
        onClose={() => setEditingFolder(null)}
        onSubmit={handleUpdateFolder}
        isSubmitting={isEditSubmitting}
        initialFolder={editingFolder ?? undefined}
      />

      <ConfirmDialog
        open={Boolean(deletingFolder)}
        title="폴더를 삭제할까요?"
        description={`'${deletingFolder?.name}' 폴더와 저장된 모든 링크가 함께 삭제됩니다.`}
        isLoading={deleteFolderMutation.isPending}
        onConfirm={handleDeleteFolder}
        onClose={() => setDeletingFolder(null)}
      />

      <QuickLaunchEditModal
        open={isQuickLaunchOpen}
        links={allLinks}
        selectedIds={quickLaunchSelectedIds}
        onClose={() => setIsQuickLaunchOpen(false)}
        onSave={handleSaveQuickLaunch}
      />
    </div>
  );
}
