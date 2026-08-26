import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LayoutGrid, Link2, PanelsTopLeft, Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Logo } from "../../../shared/ui/Logo";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { Spinner } from "../../../shared/ui/Spinner";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { ApiRequestError } from "../../../shared/api/client";
import { UserAvatar } from "../../../shared/ui/UserAvatar";
import { UserMenu } from "../../auth/components/UserMenu";
import { SortableLinkGrid } from "../../links/components/SortableLinkGrid";
import { LinkFormModal } from "../../links/components/LinkFormModal";
import {
  useCreateLinkMutation,
  useDeleteLinkMutation,
  useLinksQuery,
  useReorderLinksMutation,
  useUpdateLinkMutation,
} from "../../links/hooks/useLinkQueries";
import type { Link as LinkItem } from "../../links/types";
import type { LinkFormValues } from "../../links/schema/linkSchema";
import { FolderCover } from "../components/FolderCover";
import { FolderFormModal } from "../components/FolderFormModal";
import { InviteFolderModal } from "../components/InviteFolderModal";
import { CategoryFilterBar } from "../components/CategoryFilterBar";
import type { CategoryFilter } from "../components/CategoryFilterBar";
import {
  useDeleteFolderMutation,
  useFolderQuery,
  useUpdateFolderMutation,
} from "../hooks/useFolderQueries";
import type { FolderFormValues } from "../schema/folderSchema";
import { useLinkViewStore } from "../../../shared/preferences/linkViewStore";
import { cn } from "../../../shared/lib/cn";
import { useT } from "../../../shared/i18n/useT";

type LinkSort = "newest" | "oldest" | "custom";

function sortStorageKey(folderId: string) {
  return `link-gallery-link-sort:${folderId}`;
}

function categoryFilterStorageKey(folderId: string) {
  return `link-gallery-category-filter:${folderId}`;
}

function loadLinkSort(folderId: string): LinkSort {
  try {
    const raw = localStorage.getItem(sortStorageKey(folderId));
    if (raw === "newest" || raw === "oldest" || raw === "custom") return raw;
  } catch {
    /* ignore */
  }
  return "newest";
}

function loadCategoryFilter(folderId: string): CategoryFilter {
  try {
    const raw = localStorage.getItem(categoryFilterStorageKey(folderId));
    if (raw && raw.length > 0) return raw;
  } catch {
    /* ignore */
  }
  return "all";
}

export function FolderDetailPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { t } = useT();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LinkSort>("newest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [isFolderEditOpen, setIsFolderEditOpen] = useState(false);
  const [isFolderDeleteOpen, setIsFolderDeleteOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditLinkSubmitting, setIsEditLinkSubmitting] = useState(false);

  const folderQuery = useFolderQuery(folderId);
  const linksQuery = useLinksQuery(folderId);
  const createLinkMutation = useCreateLinkMutation(folderId ?? "");
  const updateLinkMutation = useUpdateLinkMutation(folderId ?? "");
  const deleteLinkMutation = useDeleteLinkMutation(folderId ?? "");
  const reorderLinksMutation = useReorderLinksMutation(folderId ?? "");
  const updateFolderMutation = useUpdateFolderMutation();
  const deleteFolderMutation = useDeleteFolderMutation();
  const linkView = useLinkViewStore((state) => state.mode);
  const setLinkView = useLinkViewStore((state) => state.setMode);

  const folder = folderQuery.data;
  const links = useMemo(() => linksQuery.data ?? [], [linksQuery.data]);
  const isOwner = folder?.myRole === "OWNER";
  const isShared = (folder?.memberCount ?? 0) > 1;
  const members = folder?.members ?? [];

  useEffect(() => {
    if (!folderId) return;
    setSort(loadLinkSort(folderId));
    setCategoryFilter(loadCategoryFilter(folderId));
  }, [folderId]);

  const categories = useMemo(() => {
    const names = new Set<string>();
    for (const link of links) {
      if (link.category) names.add(link.category);
    }
    return [...names].sort((left, right) => left.localeCompare(right, "ko"));
  }, [links]);

  const uncategorizedCount = useMemo(
    () => links.filter((link) => !link.category).length,
    [links]
  );

  useEffect(() => {
    if (linksQuery.isLoading) return;
    if (categoryFilter === "all") return;
    if (categoryFilter === "none") {
      if (uncategorizedCount === 0) setCategoryFilter("all");
      return;
    }
    if (!categories.includes(categoryFilter)) setCategoryFilter("all");
  }, [categories, categoryFilter, linksQuery.isLoading, uncategorizedCount]);

  const visibleLinks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = links.filter((link) => {
      if (categoryFilter === "none" && link.category) return false;
      if (categoryFilter !== "all" && categoryFilter !== "none" && link.category !== categoryFilter) {
        return false;
      }
      if (keyword && !link.title.toLowerCase().includes(keyword)) return false;
      return true;
    });

    return [...filtered].sort((left, right) => {
      if (sort === "newest") {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
      if (sort === "oldest") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }
      return left.position - right.position;
    });
  }, [links, search, sort, categoryFilter]);

  function handleSortChange(next: LinkSort) {
    setSort(next);
    if (!folderId) return;
    try {
      localStorage.setItem(sortStorageKey(folderId), next);
    } catch {
      /* ignore */
    }
  }

  function handleCategoryFilterChange(next: CategoryFilter) {
    setCategoryFilter(next);
    if (!folderId) return;
    try {
      localStorage.setItem(categoryFilterStorageKey(folderId), next);
    } catch {
      /* ignore */
    }
  }

  async function handleCreateLink(values: LinkFormValues) {
    try {
      await createLinkMutation.mutateAsync(values);
      toast.success(t("link.saved"));
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("link.saveFailed");
      toast.error(message);
    }
  }

  async function handleUpdateLink(values: LinkFormValues) {
    if (!editingLink) return;
    setIsEditLinkSubmitting(true);
    try {
      await updateLinkMutation.mutateAsync({ linkId: editingLink.id, input: values });
      toast.success(t("link.updated"));
      setEditingLink(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("link.updateFailed");
      toast.error(message);
    } finally {
      setIsEditLinkSubmitting(false);
    }
  }

  async function handleDeleteLink() {
    if (!deletingLink) return;
    try {
      await deleteLinkMutation.mutateAsync(deletingLink.id);
      toast.success(t("link.deleted"));
      setDeletingLink(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("link.deleteFailed");
      toast.error(message);
    }
  }

  async function handleUpdateFolder(values: FolderFormValues) {
    if (!folderId) return;
    try {
      await updateFolderMutation.mutateAsync({ folderId, input: values });
      toast.success(t("dash.updated"));
      setIsFolderEditOpen(false);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("dash.updateFailed");
      toast.error(message);
    }
  }

  async function handleDeleteFolder() {
    if (!folderId) return;
    try {
      await deleteFolderMutation.mutateAsync(folderId);
      toast.success(t("dash.deleted"));
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("dash.deleteFailed");
      toast.error(message);
    }
  }

  if (folderQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner label={t("dash.loadingFolders")} />
      </div>
    );
  }

  if (folderQuery.isError || !folder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4">
        <EmptyState
          icon={<Link2 className="h-8 w-8" />}
          title={t("folder.notFound")}
          description={t("folder.notFoundBody")}
          action={
            <Link to="/dashboard">
              <Button>{t("folder.backDashboard")}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo to="/dashboard" />
          <UserMenu />
        </PageContainer>
      </header>

      <div className="pt-16">
        <div className="relative h-40 w-full sm:h-52">
          <FolderCover coverType={folder.coverType} coverValue={folder.coverValue} />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
        </div>
      </div>

      <PageContainer className="relative -mt-16 flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("dash.myFolders")}
            </Link>
            <div className="flex items-center gap-3">
              {folder.icon ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-2xl shadow-sm">
                  {folder.icon}
                </span>
              ) : null}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{folder.name}</h1>
                <p className="mt-1 text-sm text-ink-soft">{t("common.countLinks", { count: folder.linkCount })}</p>
                {isShared ? (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {members.slice(0, 4).map((member) => (
                        <UserAvatar
                          key={member.id}
                          nickname={member.nickname}
                          avatarUrl={member.avatarUrl}
                          avatarType={member.avatarType}
                          avatarValue={member.avatarValue}
                          size="md"
                          className="border-2 border-canvas"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-ink-soft">{t("folder.togetherCount", { count: folder.memberCount })}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsFolderEditOpen(true)}>
                  {t("folder.editTitle")}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsInviteOpen(true)}>
                  <Users className="h-4 w-4" />
                  {t("folder.invite")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsFolderDeleteOpen(true)}>
                  {t("common.delete")}
                </Button>
              </>
            ) : (
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 text-sm font-medium text-brand-600">
                <Users className="h-3.5 w-3.5" />
                {t("folder.sharedBadge")}
              </span>
            )}
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("folder.addLink")}
            </Button>
          </div>
        </div>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-ink">{t("folder.savedLinks")}</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div
                role="radiogroup"
                aria-label={t("folder.viewMode")}
                className="inline-flex h-11 items-center rounded-2xl border border-line bg-surface p-1"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={linkView === "card"}
                  aria-label={t("folder.viewCard")}
                  title={t("settings.viewCard")}
                  onClick={() => setLinkView("card")}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                    linkView === "card" ? "bg-canvas text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={linkView === "preview"}
                  aria-label={t("folder.viewPreview")}
                  title={t("settings.viewPreview")}
                  onClick={() => setLinkView("preview")}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                    linkView === "preview" ? "bg-canvas text-ink shadow-sm" : "text-ink-soft hover:text-ink"
                  )}
                >
                  <PanelsTopLeft className="h-4 w-4" />
                </button>
              </div>
              <select
                value={sort}
                onChange={(event) => handleSortChange(event.target.value as LinkSort)}
                aria-label={t("folder.sort")}
                className="h-11 rounded-2xl border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <option value="newest">{t("folder.sortNewest")}</option>
                <option value="oldest">{t("folder.sortOldest")}</option>
                <option value="custom">{t("folder.sortCustom")}</option>
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("folder.searchLinks")}
                  className="w-full pl-10 sm:w-56"
                  aria-label={t("folder.searchLinks")}
                />
              </div>
            </div>
          </div>

          <CategoryFilterBar
            categories={categories}
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            uncategorizedCount={uncategorizedCount}
          />

          {!search.trim() && categoryFilter === "all" && visibleLinks.length > 1 ? (
            <p className="mb-3 text-xs text-ink-soft">
              {t("folder.dragHint")}
            </p>
          ) : null}

          {linksQuery.isLoading ? (
            <Spinner label={t("folder.loadingLinks")} />
          ) : visibleLinks.length === 0 ? (
            search.trim() ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title={t("dash.searchEmpty")}
                description={t("folder.noSearchBody", { query: search })}
              />
            ) : categoryFilter !== "all" ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title={t("folder.noCategory")}
                description={
                  categoryFilter === "none"
                    ? t("folder.noUncategorized")
                    : t("folder.noCategoryBody", { name: categoryFilter })
                }
              />
            ) : (
              <EmptyState
                icon={<Link2 className="h-8 w-8" />}
                title={t("folder.noLinks")}
                description={t("folder.noLinksBody")}
                action={
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t("folder.firstLink")}
                  </Button>
                }
              />
            )
          ) : (
            <SortableLinkGrid
              links={visibleLinks}
              canReorder={!search.trim() && categoryFilter === "all"}
              onReorder={(orderedIds) => {
                if (!folderId) return;
                if (sort !== "custom") handleSortChange("custom");
                void reorderLinksMutation.mutateAsync(orderedIds).catch((error) => {
                  const message =
                    error instanceof ApiRequestError ? error.message : t("folder.reorderFailed");
                  toast.error(message);
                });
              }}
              onEdit={setEditingLink}
              onDelete={setDeletingLink}
              showCreator={isShared}
              view={linkView}
            />
          )}
        </section>
      </PageContainer>

      <LinkFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateLink}
        isSubmitting={createLinkMutation.isPending}
        existingCategories={categories}
      />

      <LinkFormModal
        open={Boolean(editingLink)}
        onClose={() => setEditingLink(null)}
        onSubmit={handleUpdateLink}
        isSubmitting={isEditLinkSubmitting}
        initialLink={editingLink ?? undefined}
        existingCategories={categories}
      />

      <ConfirmDialog
        open={Boolean(deletingLink)}
        title={t("link.deleteTitle")}
        description={t("link.deleteBody", { name: deletingLink?.title ?? "" })}
        isLoading={deleteLinkMutation.isPending}
        onConfirm={handleDeleteLink}
        onClose={() => setDeletingLink(null)}
      />

      <FolderFormModal
        open={isFolderEditOpen}
        onClose={() => setIsFolderEditOpen(false)}
        onSubmit={handleUpdateFolder}
        isSubmitting={updateFolderMutation.isPending}
        initialFolder={folder}
      />

      <InviteFolderModal
        open={isInviteOpen}
        folderId={folder.id}
        folderName={folder.name}
        onClose={() => setIsInviteOpen(false)}
      />

      <ConfirmDialog
        open={isFolderDeleteOpen}
        title={t("dash.deleteTitle")}
        description={t("dash.deleteBody", { name: folder.name })}
        isLoading={deleteFolderMutation.isPending}
        onConfirm={handleDeleteFolder}
        onClose={() => setIsFolderDeleteOpen(false)}
      />
    </div>
  );
}
