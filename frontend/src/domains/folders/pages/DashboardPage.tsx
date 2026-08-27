import { useEffect, useMemo, useState } from "react";
import { Plus, Search, FolderHeart, Users } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { SiteHeader } from "../../../shared/ui/SiteHeader";
import { AmbientGlow } from "../../../shared/ui/AmbientGlow";
import { Logo } from "../../../shared/ui/Logo";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { Spinner } from "../../../shared/ui/Spinner";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { ApiRequestError } from "../../../shared/api/client";
import { APP_NAME } from "../../../shared/constants/app";
import { useAuthStore } from "../../auth/store/authStore";
import { useAllLinksQuery, useRecentLinksQuery } from "../../links/hooks/useLinkQueries";
import { RecentLinkCard } from "../../links/components/RecentLinkCard";
import { QuickLaunchItem } from "../../links/components/QuickLaunchItem";
import { QuickLaunchEditModal } from "../../links/components/QuickLaunchEditModal";
import { loadQuickLaunchIds, saveQuickLaunchIds } from "../../links/lib/quickLaunch";
import { FolderCard } from "../components/FolderCard";
import { FolderFormModal } from "../components/FolderFormModal";
import { JoinFolderModal } from "../components/JoinFolderModal";
import { DashboardHero } from "../components/DashboardHero";
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useFoldersQuery,
  useUpdateFolderMutation,
} from "../hooks/useFolderQueries";
import type { Folder } from "../types";
import type { FolderFormValues } from "../schema/folderSchema";
import { useT } from "../../../shared/i18n/useT";

export function DashboardPage() {
  const { t } = useT();
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
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

  const ownedFolders = useMemo(
    () => filteredFolders.filter((folder) => folder.myRole === "OWNER"),
    [filteredFolders]
  );
  const sharedFolders = useMemo(
    () => filteredFolders.filter((folder) => folder.myRole !== "OWNER"),
    [filteredFolders]
  );

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
      toast.success(t("dash.created"));
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("dash.createFailed");
      toast.error(message);
    }
  }

  async function handleUpdateFolder(values: FolderFormValues) {
    if (!editingFolder) return;
    setIsEditSubmitting(true);
    try {
      await updateFolderMutation.mutateAsync({ folderId: editingFolder.id, input: values });
      toast.success(t("dash.updated"));
      setEditingFolder(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("dash.updateFailed");
      toast.error(message);
    } finally {
      setIsEditSubmitting(false);
    }
  }

  async function handleDeleteFolder() {
    if (!deletingFolder) return;
    try {
      await deleteFolderMutation.mutateAsync(deletingFolder.id);
      toast.success(t("dash.deleted"));
      setDeletingFolder(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("dash.deleteFailed");
      toast.error(message);
    }
  }

  function handleSaveQuickLaunch(ids: string[]) {
    if (!user?.id) return;
    saveQuickLaunchIds(user.id, ids);
    setPinnedIds(ids);
    toast.success(t("dash.quickSaved"));
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-canvas">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem]">
        <AmbientGlow />
      </div>

      <PageContainer className="relative flex flex-col gap-12 pt-28 pb-16">
        <DashboardHero
          nickname={user?.nickname ?? ""}
          folders={folders}
          onCreateFolder={() => setIsCreateOpen(true)}
        />

        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-ink">{t("dash.myFolders")}</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("dash.searchFolders")}
                  className="w-full pl-10 sm:w-56"
                  aria-label={t("dash.searchFolders")}
                />
              </div>
              <Button variant="secondary" onClick={() => setIsJoinOpen(true)}>
                <Users className="h-4 w-4" />
                {t("dash.joinWithCode")}
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("dash.newFolder")}
              </Button>
            </div>
          </div>

          {foldersQuery.isLoading ? (
            <Spinner label={t("dash.loadingFolders")} />
          ) : ownedFolders.length === 0 && sharedFolders.length === 0 ? (
            search ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title={t("dash.searchEmpty")}
                description={t("dash.searchEmptyBody", { query: search })}
              />
            ) : (
              <EmptyState
                icon={<FolderHeart className="h-8 w-8" />}
                title={t("dash.emptyTitle")}
                description={t("dash.noFoldersBody")}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="secondary" onClick={() => setIsJoinOpen(true)}>
                      <Users className="h-4 w-4" />
                      {t("dash.joinWithCode")}
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                      <Plus className="h-4 w-4" />
                      {t("dash.firstFolder")}
                    </Button>
                  </div>
                }
              />
            )
          ) : (
            <>
              {ownedFolders.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                  {ownedFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onEdit={setEditingFolder}
                      onDelete={setDeletingFolder}
                    />
                  ))}
                </div>
              ) : search ? null : (
                <p className="py-6 text-sm text-ink-soft">{t("dash.noOwned")}</p>
              )}

              {sharedFolders.length > 0 ? (
                <div className="mt-10">
                  <h3 className="mb-4 text-lg font-semibold tracking-tight text-ink">{t("dash.sharedFolders")}</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                    {sharedFolders.map((folder) => (
                      <FolderCard key={folder.id} folder={folder} />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">{t("dash.recentSites")}</h2>
          {recentLinks.length > 0 ? (
            <div className="-mx-1 flex gap-5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {recentLinks.map((link) => (
                <RecentLinkCard key={link.id} link={link} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-sm text-ink-soft">{t("dash.noRecent")}</p>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-ink">{t("dash.quickLaunch")}</h2>
            <button
              type="button"
              onClick={() => setIsQuickLaunchOpen(true)}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              {t("common.edit")}
            </button>
          </div>
          {quickLaunchLinks.length > 0 ? (
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickLaunchLinks.map((link) => (
                <QuickLaunchItem key={link.id} link={link} />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsQuickLaunchOpen(true)}
              className="py-8 text-left text-sm text-ink-soft hover:text-ink"
            >
              {t("dash.quickEmpty")}
            </button>
          )}
        </section>
      </PageContainer>

      <footer className="border-t border-line py-8">
        <PageContainer className="flex flex-col items-center justify-between gap-3 text-sm text-ink-soft sm:flex-row">
          <Logo to="/dashboard" />
          <p className="break-keep">{t("dash.footerTag", { name: APP_NAME })}</p>
        </PageContainer>
      </footer>

      <FolderFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateFolder}
        isSubmitting={createFolderMutation.isPending}
      />

      <JoinFolderModal open={isJoinOpen} onClose={() => setIsJoinOpen(false)} />

      <FolderFormModal
        open={Boolean(editingFolder)}
        onClose={() => setEditingFolder(null)}
        onSubmit={handleUpdateFolder}
        isSubmitting={isEditSubmitting}
        initialFolder={editingFolder ?? undefined}
      />

      <ConfirmDialog
        open={Boolean(deletingFolder)}
        title={t("dash.deleteTitle")}
        description={t("dash.deleteBody", { name: deletingFolder?.name ?? "" })}
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
