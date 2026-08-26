import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderHeart, ImagePlus, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Logo } from "../../../shared/ui/Logo";
import { Field } from "../../../shared/ui/Field";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { Modal } from "../../../shared/ui/Modal";
import { UserAvatar } from "../../../shared/ui/UserAvatar";
import { Spinner } from "../../../shared/ui/Spinner";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { ApiRequestError } from "../../../shared/api/client";
import { UserMenu } from "../components/UserMenu";
import { AppearancePopover } from "../components/AppearancePopover";
import { useAuthStore } from "../store/authStore";
import { updateProfileFormSchema } from "../schema/authSchema";
import type { UpdateProfileFormValues } from "../schema/authSchema";
import { authApi } from "../api/authApi";
import { useUpdateProfileMutation } from "../hooks/useAuthQueries";
import { useFoldersQuery } from "../../folders/hooks/useFolderQueries";
import { useAllLinksQuery } from "../../links/hooks/useLinkQueries";
import { FolderCover } from "../../folders/components/FolderCover";
import type { Folder } from "../../folders/types";
import { useT } from "../../../shared/i18n/useT";

type ProfileTab = "all" | "owned" | "shared";

export function SettingsPage() {
  const { t } = useT();
  const user = useAuthStore((state) => state.user);
  const foldersQuery = useFoldersQuery();
  const linksQuery = useAllLinksQuery();
  const [tab, setTab] = useState<ProfileTab>("all");
  const [editing, setEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const updateProfileMutation = useUpdateProfileMutation();
  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "all", label: t("profile.tabAll") },
    { id: "owned", label: t("profile.tabOwned") },
    { id: "shared", label: t("profile.tabShared") },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues: { nickname: user?.nickname ?? "", email: user?.email ?? "" },
  });

  const folders = foldersQuery.data ?? [];
  const ownedFolders = useMemo(() => folders.filter((folder) => folder.myRole === "OWNER"), [folders]);
  const sharedFolders = useMemo(() => folders.filter((folder) => folder.myRole !== "OWNER"), [folders]);
  const visibleFolders = tab === "owned" ? ownedFolders : tab === "shared" ? sharedFolders : folders;
  const linkCount = linksQuery.data?.length ?? folders.reduce((sum, folder) => sum + folder.linkCount, 0);

  useEffect(() => {
    reset({ nickname: user?.nickname ?? "", email: user?.email ?? "" });
  }, [reset, user?.nickname, user?.email]);

  function startEdit() {
    if (!user) return;
    reset({ nickname: user.nickname, email: user.email ?? "" });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  async function saveAvatar(next: { coverType: "SOLID" | "GRADIENT" | "IMAGE"; coverValue: string }) {
    try {
      await updateProfileMutation.mutateAsync({
        avatarType: next.coverType,
        avatarValue: next.coverValue,
      });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("profile.avatarFailed");
      toast.error(message);
    }
  }

  async function saveBanner(next: { coverType: "SOLID" | "GRADIENT" | "IMAGE"; coverValue: string }) {
    try {
      await updateProfileMutation.mutateAsync({
        bannerType: next.coverType,
        bannerValue: next.coverValue,
      });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("profile.bannerFailed");
      toast.error(message);
    }
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true);
    try {
      const uploaded = await authApi.uploadAvatar(file);
      await saveAvatar({ coverType: "IMAGE", coverValue: uploaded.url });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("common.uploadFailed");
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function uploadBanner(file: File) {
    setUploadingBanner(true);
    try {
      const uploaded = await authApi.uploadBanner(file);
      await saveBanner({ coverType: "IMAGE", coverValue: uploaded.url });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("common.uploadFailed");
      toast.error(message);
    } finally {
      setUploadingBanner(false);
    }
  }

  async function onSubmit(values: UpdateProfileFormValues) {
    try {
      await updateProfileMutation.mutateAsync({
        nickname: values.nickname,
        ...(values.email ? { email: values.email } : {}),
      });
      toast.success(t("profile.saved"));
      cancelEdit();
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("profile.saveFailed");
      toast.error(message);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo to="/dashboard" />
          <UserMenu />
        </PageContainer>
      </header>

      <div className="pt-16">
        <section className="group relative h-48 overflow-visible sm:h-56">
          <div className="absolute inset-0 overflow-hidden">
            <FolderCover
              coverType={user.bannerType ?? "GRADIENT"}
              coverValue={user.bannerValue ?? "#C6B3FF|#6427C8"}
            />
          </div>
          <div className="absolute right-4 top-3 z-10 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <AppearancePopover
              title={t("profile.cover")}
              align="right"
              coverType={user.bannerType}
              coverValue={user.bannerValue}
              onChange={saveBanner}
              onUpload={uploadBanner}
              isUploading={uploadingBanner}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/70"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {t("profile.changeCover")}
                </button>
              }
            />
          </div>
          <PageContainer className="relative h-full">
            <div className="absolute bottom-0 left-5 flex items-end gap-3 sm:left-8 sm:gap-4">
              <div className="relative top-12">
                <UserAvatar
                  nickname={user.nickname}
                  avatarUrl={user.avatarUrl}
                  avatarType={user.avatarType}
                  avatarValue={user.avatarValue}
                  size="xl"
                  className="h-[120px] w-[120px] ring-4 ring-white sm:h-[150px] sm:w-[150px]"
                />
                <div className="absolute bottom-1 right-1">
                  <AppearancePopover
                    title={t("profile.photo")}
                    align="left"
                    placement="top"
                    coverType={user.avatarType}
                    coverValue={user.avatarValue}
                    fallbackImageUrl={user.avatarUrl}
                    onChange={saveAvatar}
                    onUpload={uploadAvatar}
                    isUploading={uploadingAvatar}
                    trigger={
                      <button
                        type="button"
                        aria-label={t("profile.changePhoto")}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-md hover:bg-canvas"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    }
                  />
                </div>
              </div>
              <div className="mb-5 min-w-0 pb-1">
                <h1 className="inline-block max-w-full truncate bg-black/75 px-3 py-1 text-2xl font-bold text-white sm:text-3xl">
                  {user.nickname}
                </h1>
                <p className="mt-1">
                  <span className="inline-block bg-black/55 px-2 py-0.5 text-sm text-white/90">@{user.username}</span>
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        <PageContainer>
          <div className="flex justify-end pt-16 sm:pt-[4.5rem]">
            <Button variant="secondary" size="sm" onClick={startEdit}>
              <Pencil className="h-4 w-4" />
              {t("common.edit")}
            </Button>
          </div>

          <nav className="mt-4 flex gap-5 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  tab === item.id
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-ink">{t("profile.recent")}</h2>
              {foldersQuery.isLoading ? (
                <div className="mt-8">
                  <Spinner label={t("dash.loadingFolders")} />
                </div>
              ) : visibleFolders.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon={<FolderHeart className="h-8 w-8" />}
                    title={tab === "shared" ? t("profile.noShared") : t("dash.emptyTitle")}
                    description={
                      tab === "shared" ? t("profile.noSharedBody") : t("profile.noFoldersBody")
                    }
                  />
                </div>
              ) : (
                <ul className="mt-5 divide-y divide-line">
                  {visibleFolders.map((folder) => (
                    <ProfileFolderRow key={folder.id} folder={folder} />
                  ))}
                </ul>
              )}
            </section>

            <aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="grid grid-cols-3 gap-3 text-center lg:grid-cols-1 lg:text-left">
                <Stat label={t("profile.statFolders")} value={ownedFolders.length} />
                <Stat label={t("profile.statLinks")} value={linkCount} />
                <Stat label={t("profile.statShared")} value={sharedFolders.length} />
              </div>
              <Link
                to="/dashboard"
                className="mt-8 inline-block text-sm font-medium text-brand-600 hover:underline"
              >
                {t("settings.home")}
              </Link>
            </aside>
          </div>
        </PageContainer>
      </div>

      <Modal open={editing} onClose={cancelEdit} title={t("profile.editTitle")}>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label={t("auth.nickname")} htmlFor="profile-nickname" error={errors.nickname?.message}>
            <Input
              id="profile-nickname"
              autoComplete="nickname"
              hasError={Boolean(errors.nickname)}
              {...register("nickname")}
            />
          </Field>
          <Field label={t("settings.username")} htmlFor="profile-username">
            <Input id="profile-username" value={user.username} readOnly className="bg-canvas text-ink-soft" />
          </Field>
          <Field
            label={t("profile.email")}
            htmlFor="profile-email"
            optional
            error={errors.email?.message}
            hint={t("profile.emailHint")}
          >
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              hasError={Boolean(errors.email)}
              {...register("email")}
            />
          </Field>

          <Button type="submit" className="w-full" isLoading={updateProfileMutation.isPending}>
            {t("profile.save")}
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-bold text-ink">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}

function ProfileFolderRow({ folder }: { folder: Folder }) {
  const { t } = useT();
  const shared = folder.memberCount > 1;

  return (
    <li>
      <Link
        to={`/folders/${folder.id}`}
        className="flex items-center gap-4 py-4 transition-colors hover:bg-canvas/80"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-sm">
          <FolderCover coverType={folder.coverType} coverValue={folder.coverValue} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">
            {folder.icon ? `${folder.icon} ` : ""}
            {folder.name}
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-ink-soft">
            <span>{t("common.countLinks", { count: folder.linkCount })}</span>
            {shared ? (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {t("common.countPeople", { count: folder.memberCount })}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    </li>
  );
}
