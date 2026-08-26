import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Logo } from "../../../shared/ui/Logo";
import { ThemeToggle } from "../../../shared/ui/ThemeToggle";
import { Field } from "../../../shared/ui/Field";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
import { UserMenu } from "../components/UserMenu";
import { useLinkViewStore } from "../../../shared/preferences/linkViewStore";
import type { LinkViewMode } from "../../../shared/preferences/linkView";
import { LINK_VIEW_STORAGE_KEY } from "../../../shared/preferences/linkView";
import { cn } from "../../../shared/lib/cn";
import { useT } from "../../../shared/i18n/useT";
import type { Locale } from "../../../shared/i18n/locale";
import { useAuthStore } from "../store/authStore";
import { ApiRequestError } from "../../../shared/api/client";
import { changePasswordFormSchema } from "../schema/authSchema";
import type { ChangePasswordFormValues } from "../schema/authSchema";
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useResetWorkspaceMutation,
} from "../hooks/useAuthQueries";

function clearLocalGalleryData() {
  const toRemove: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    if (
      key === LINK_VIEW_STORAGE_KEY ||
      key.startsWith("link-gallery-link-sort:") ||
      key.startsWith("link-gallery-category-filter:") ||
      key.startsWith("link-gallery-quick-launch:")
    ) {
      toRemove.push(key);
    }
  }
  for (const key of toRemove) localStorage.removeItem(key);
}

export function AccountSettingsPage() {
  const { t, locale, setLocale } = useT();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const linkView = useLinkViewStore((state) => state.mode);
  const setLinkView = useLinkViewStore((state) => state.setMode);
  const changePasswordMutation = useChangePasswordMutation();
  const resetMutation = useResetWorkspaceMutation();
  const deleteMutation = useDeleteAccountMutation();

  const [usernameUnlocked, setUsernameUnlocked] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { username: "", currentPassword: "", password: "", passwordConfirm: "" },
  });

  function confirmPasswordUsername() {
    const value = (getValues("username") || "").trim().toLowerCase();
    if (!user || value !== user.username) {
      setUsernameUnlocked(false);
      setUsernameError(t("settings.usernameMismatch"));
      return;
    }
    setUsernameError(null);
    setUsernameUnlocked(true);
  }

  async function onChangePassword(values: ChangePasswordFormValues) {
    try {
      await changePasswordMutation.mutateAsync(values);
      toast.success(t("settings.passwordChanged"));
      setUsernameUnlocked(false);
      reset({ username: "", currentPassword: "", password: "", passwordConfirm: "" });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("settings.passwordFailed");
      toast.error(message);
    }
  }

  async function handleReset() {
    if (!user) return;
    const username = confirmUsername.trim().toLowerCase();
    if (username !== user.username) {
      toast.error(t("settings.usernameMismatch"));
      return;
    }
    try {
      await resetMutation.mutateAsync({ username });
      clearLocalGalleryData();
      useLinkViewStore.getState().setMode("card");
      toast.success(t("settings.resetDone"));
      setResetOpen(false);
      setConfirmUsername("");
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("settings.resetFailed");
      toast.error(message);
    }
  }

  async function handleDelete() {
    if (!user) return;
    const username = confirmUsername.trim().toLowerCase();
    if (username !== user.username) {
      toast.error(t("settings.usernameMismatch"));
      return;
    }
    try {
      await deleteMutation.mutateAsync({
        username,
        ...(user.hasPassword ? { currentPassword: deletePassword } : {}),
      });
      toast.success(t("settings.deleteDone"));
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("settings.deleteFailed");
      toast.error(message);
    }
  }

  if (!user) return null;

  const viewOptions: { value: LinkViewMode; label: string; hint: string }[] = [
    { value: "card", label: t("settings.viewCard"), hint: t("settings.viewCardHint") },
    { value: "preview", label: t("settings.viewPreview"), hint: t("settings.viewPreviewHint") },
  ];

  const languages: { value: Locale; label: string }[] = [
    { value: "ko", label: t("settings.languageKo") },
    { value: "en", label: t("settings.languageEn") },
  ];

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo to="/dashboard" />
          <UserMenu />
        </PageContainer>
      </header>

      <PageContainer className="max-w-lg pt-24">
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="text-xl font-semibold text-ink">{t("settings.title")}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t("settings.subtitle")}</p>
          </div>

          <section className="flex flex-col gap-6 rounded-[32px] border border-line bg-surface p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-ink">{t("settings.appearance")}</h2>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-ink">{t("settings.theme")}</p>
              <ThemeToggle />
              <p className="text-sm text-ink-soft">{t("settings.themeHint")}</p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-ink">{t("settings.language")}</p>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((option) => {
                  const selected = locale === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLocale(option.value)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
                        selected
                          ? "border-brand-500 bg-brand-500/10 text-ink"
                          : "border-line bg-canvas text-ink hover:border-brand-300"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-ink-soft">{t("settings.languageHint")}</p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-ink">{t("settings.linkView")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {viewOptions.map((option) => {
                  const selected = linkView === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLinkView(option.value)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-line bg-canvas hover:border-brand-300"
                      )}
                    >
                      <p className="text-sm font-semibold text-ink">{option.label}</p>
                      <p className="mt-1 text-xs text-ink-soft">{option.hint}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-ink-soft">{t("settings.linkViewHint")}</p>
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-[32px] border border-line bg-surface p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-ink">{t("settings.account")}</h2>

            <Field label={t("settings.username")} htmlFor="settings-username" hint={t("settings.usernameReadonly")}>
              <Input id="settings-username" value={user.username} readOnly className="bg-canvas text-ink-soft" />
            </Field>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-ink">{t("settings.password")}</p>
              {user.hasPassword === false ? (
                <p className="text-sm text-ink-soft">{t("settings.passwordGoogle")}</p>
              ) : (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleSubmit((values) => {
                    if (!usernameUnlocked) {
                      confirmPasswordUsername();
                      return;
                    }
                    return onChangePassword(values);
                  })}
                  noValidate
                >
                  <p className="text-sm text-ink-soft">{t("settings.passwordStep")}</p>
                  <Field
                    label={t("settings.username")}
                    htmlFor="password-username"
                    error={errors.username?.message ?? usernameError ?? undefined}
                    success={usernameUnlocked ? t("settings.usernameOk") : undefined}
                  >
                    <div className="flex gap-2">
                      <Input
                        id="password-username"
                        autoComplete="username"
                        hasError={Boolean(errors.username || usernameError)}
                        {...register("username", {
                          onChange: () => {
                            setUsernameUnlocked(false);
                            setUsernameError(null);
                          },
                        })}
                      />
                      <Button type="button" variant="secondary" className="h-11 shrink-0 px-4" onClick={confirmPasswordUsername}>
                        {t("settings.confirmUsername")}
                      </Button>
                    </div>
                  </Field>

                  {usernameUnlocked ? (
                    <>
                      <Field
                        label={t("settings.currentPassword")}
                        htmlFor="current-password"
                        error={errors.currentPassword?.message}
                      >
                        <Input
                          id="current-password"
                          type="password"
                          autoComplete="current-password"
                          hasError={Boolean(errors.currentPassword)}
                          {...register("currentPassword")}
                        />
                      </Field>
                      <Field label={t("settings.newPassword")} htmlFor="new-password" error={errors.password?.message}>
                        <Input
                          id="new-password"
                          type="password"
                          autoComplete="new-password"
                          hasError={Boolean(errors.password)}
                          {...register("password")}
                        />
                      </Field>
                      <Field
                        label={t("settings.confirmPassword")}
                        htmlFor="confirm-password"
                        error={errors.passwordConfirm?.message}
                      >
                        <Input
                          id="confirm-password"
                          type="password"
                          autoComplete="new-password"
                          hasError={Boolean(errors.passwordConfirm)}
                          {...register("passwordConfirm")}
                        />
                      </Field>
                      <Button type="submit" isLoading={changePasswordMutation.isPending}>
                        {t("settings.savePassword")}
                      </Button>
                    </>
                  ) : null}
                </form>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-[32px] border border-line bg-surface p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-ink">{t("settings.data")}</h2>
            <p className="text-sm text-ink-soft">{t("settings.resetHint")}</p>
            <Button variant="secondary" className="w-fit" onClick={() => { setConfirmUsername(""); setResetOpen(true); }}>
              {t("settings.reset")}
            </Button>
          </section>

          <section className="flex flex-col gap-4 rounded-[32px] border border-red-200 bg-surface p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-red-600">{t("settings.danger")}</h2>
            <p className="text-sm text-ink-soft">{t("settings.deleteHint")}</p>
            <Button
              variant="danger"
              className="w-fit border border-red-200 px-4"
              onClick={() => {
                setConfirmUsername("");
                setDeletePassword("");
                setDeleteOpen(true);
              }}
            >
              {t("settings.delete")}
            </Button>
          </section>

          <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
            {t("settings.home")}
          </Link>
        </div>
      </PageContainer>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title={t("settings.resetConfirmTitle")}
        description={t("settings.resetConfirmBody")}
        confirmLabel={t("settings.resetAction")}
        cancelLabel={t("settings.cancel")}
        isLoading={resetMutation.isPending}
        onConfirm={() => void handleReset()}
      >
        <Field label={t("settings.typeUsername")} htmlFor="reset-username">
          <Input
            id="reset-username"
            value={confirmUsername}
            onChange={(event) => setConfirmUsername(event.target.value)}
            autoComplete="off"
            placeholder={user.username}
          />
        </Field>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t("settings.deleteConfirmTitle")}
        description={t("settings.deleteConfirmBody")}
        confirmLabel={t("settings.deleteAction")}
        cancelLabel={t("settings.cancel")}
        isLoading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      >
        <Field label={t("settings.typeUsername")} htmlFor="delete-username">
          <Input
            id="delete-username"
            value={confirmUsername}
            onChange={(event) => setConfirmUsername(event.target.value)}
            autoComplete="off"
            placeholder={user.username}
          />
        </Field>
        {user.hasPassword ? (
          <Field label={t("settings.currentPassword")} htmlFor="delete-password">
            <Input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              autoComplete="current-password"
            />
          </Field>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
