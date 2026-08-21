import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Link2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Logo } from "../../../shared/ui/Logo";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { Spinner } from "../../../shared/ui/Spinner";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { ApiRequestError } from "../../../shared/api/client";
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
import { CategoryFilterBar } from "../components/CategoryFilterBar";
import type { CategoryFilter } from "../components/CategoryFilterBar";
import {
  useDeleteFolderMutation,
  useFolderQuery,
  useUpdateFolderMutation,
} from "../hooks/useFolderQueries";
import type { FolderFormValues } from "../schema/folderSchema";

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

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LinkSort>("newest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  const [isFolderEditOpen, setIsFolderEditOpen] = useState(false);
  const [isFolderDeleteOpen, setIsFolderDeleteOpen] = useState(false);
  const [isEditLinkSubmitting, setIsEditLinkSubmitting] = useState(false);

  const folderQuery = useFolderQuery(folderId);
  const linksQuery = useLinksQuery(folderId);
  const createLinkMutation = useCreateLinkMutation(folderId ?? "");
  const updateLinkMutation = useUpdateLinkMutation(folderId ?? "");
  const deleteLinkMutation = useDeleteLinkMutation(folderId ?? "");
  const reorderLinksMutation = useReorderLinksMutation(folderId ?? "");
  const updateFolderMutation = useUpdateFolderMutation();
  const deleteFolderMutation = useDeleteFolderMutation();

  const folder = folderQuery.data;
  const links = useMemo(() => linksQuery.data ?? [], [linksQuery.data]);

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
      toast.success("링크가 저장되었습니다.");
      setIsCreateOpen(false);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "링크 저장에 실패했습니다.";
      toast.error(message);
    }
  }

  async function handleUpdateLink(values: LinkFormValues) {
    if (!editingLink) return;
    setIsEditLinkSubmitting(true);
    try {
      await updateLinkMutation.mutateAsync({ linkId: editingLink.id, input: values });
      toast.success("링크가 수정되었습니다.");
      setEditingLink(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "링크 수정에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsEditLinkSubmitting(false);
    }
  }

  async function handleDeleteLink() {
    if (!deletingLink) return;
    try {
      await deleteLinkMutation.mutateAsync(deletingLink.id);
      toast.success("링크가 삭제되었습니다.");
      setDeletingLink(null);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "링크 삭제에 실패했습니다.";
      toast.error(message);
    }
  }

  async function handleUpdateFolder(values: FolderFormValues) {
    if (!folderId) return;
    try {
      await updateFolderMutation.mutateAsync({ folderId, input: values });
      toast.success("폴더가 수정되었습니다.");
      setIsFolderEditOpen(false);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "폴더 수정에 실패했습니다.";
      toast.error(message);
    }
  }

  async function handleDeleteFolder() {
    if (!folderId) return;
    try {
      await deleteFolderMutation.mutateAsync(folderId);
      toast.success("폴더가 삭제되었습니다.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "폴더 삭제에 실패했습니다.";
      toast.error(message);
    }
  }

  if (folderQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner label="폴더를 불러오는 중..." />
      </div>
    );
  }

  if (folderQuery.isError || !folder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4">
        <EmptyState
          icon={<Link2 className="h-8 w-8" />}
          title="폴더를 찾을 수 없어요"
          description="삭제되었거나 접근 권한이 없는 폴더입니다."
          action={
            <Link to="/dashboard">
              <Button>대시보드로 돌아가기</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="border-b border-line bg-canvas/80 backdrop-blur">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo />
          <UserMenu />
        </PageContainer>
      </header>

      <div className="relative h-40 w-full sm:h-52">
        <FolderCover coverType={folder.coverType} coverValue={folder.coverValue} />
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
      </div>

      <PageContainer className="relative -mt-16 flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              내 폴더
            </Link>
            <div className="flex items-center gap-3">
              {folder.icon ? (
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-2xl shadow-sm">
                  {folder.icon}
                </span>
              ) : null}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{folder.name}</h1>
                <p className="mt-1 text-sm text-ink-soft">{folder.linkCount}개의 링크</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsFolderEditOpen(true)}>
              폴더 수정
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFolderDeleteOpen(true)}>
              삭제
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              링크 추가
            </Button>
          </div>
        </div>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-ink">저장된 링크</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={sort}
                onChange={(event) => handleSortChange(event.target.value as LinkSort)}
                aria-label="링크 정렬"
                className="h-11 rounded-2xl border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="custom">직접 배치</option>
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="저장한 이름으로 검색"
                  className="w-full pl-10 sm:w-56"
                  aria-label="저장한 이름으로 검색"
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
              카드를 끌어 위치를 바꿀 수 있어요. 옮기면 직접 배치 순서로 저장됩니다.
            </p>
          ) : null}

          {linksQuery.isLoading ? (
            <Spinner label="링크를 불러오는 중..." />
          ) : visibleLinks.length === 0 ? (
            search.trim() ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="검색 결과가 없어요"
                description={`저장한 이름에 '${search}'가 들어간 링크가 없습니다.`}
              />
            ) : categoryFilter !== "all" ? (
              <EmptyState
                icon={<Search className="h-8 w-8" />}
                title="이 카테고리에 링크가 없어요"
                description={
                  categoryFilter === "none"
                    ? "분류하지 않은 링크가 없습니다."
                    : `'${categoryFilter}'로 등록된 링크가 없습니다.`
                }
              />
            ) : (
              <EmptyState
                icon={<Link2 className="h-8 w-8" />}
                title="아직 링크가 없어요"
                description="자주 방문하는 사이트를 이 폴더에 모아보세요."
                action={
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" />
                    첫 링크 저장하기
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
                    error instanceof ApiRequestError ? error.message : "순서를 저장하지 못했습니다.";
                  toast.error(message);
                });
              }}
              onEdit={setEditingLink}
              onDelete={setDeletingLink}
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
        title="링크를 삭제할까요?"
        description={`'${deletingLink?.title}' 링크가 삭제됩니다.`}
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

      <ConfirmDialog
        open={isFolderDeleteOpen}
        title="폴더를 삭제할까요?"
        description={`'${folder.name}' 폴더와 저장된 모든 링크가 함께 삭제됩니다.`}
        isLoading={deleteFolderMutation.isPending}
        onConfirm={handleDeleteFolder}
        onClose={() => setIsFolderDeleteOpen(false)}
      />
    </div>
  );
}
