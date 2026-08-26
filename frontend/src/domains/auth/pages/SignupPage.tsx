import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Logo } from "../../../shared/ui/Logo";
import { Field } from "../../../shared/ui/Field";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { ApiRequestError } from "../../../shared/api/client";
import { signupSchema } from "../schema/authSchema";
import type { SignupFormValues } from "../schema/authSchema";
import { useSignupMutation, useUsernameAvailableQuery } from "../hooks/useAuthQueries";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { ThemeToggle } from "../../../shared/ui/ThemeToggle";
import { LocaleToggle } from "../../../shared/i18n/LocaleToggle";
import { useT } from "../../../shared/i18n/useT";

export function SignupPage() {
  const navigate = useNavigate();
  const signupMutation = useSignupMutation();
  const { t } = useT();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const usernameValue = watch("username") ?? "";
  const [debouncedUsername, setDebouncedUsername] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedUsername(usernameValue.trim().toLowerCase());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [usernameValue]);

  const usernameAvailableQuery = useUsernameAvailableQuery(debouncedUsername);
  const usernameMatchesQuery = debouncedUsername === usernameValue.trim().toLowerCase();
  const usernameTaken = usernameMatchesQuery && usernameAvailableQuery.data?.available === false;
  const usernameAvailable =
    usernameMatchesQuery && usernameAvailableQuery.data?.available === true && !errors.username;

  async function onSubmit(values: SignupFormValues) {
    if (usernameTaken) {
      toast.error(t("auth.usernameTaken"));
      return;
    }

    try {
      await signupMutation.mutateAsync(values);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("auth.signupFailed");
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle compact />
            <Link to="/login">
              <Button size="sm">{t("landing.login")}</Button>
            </Link>
          </div>
        </PageContainer>
      </header>

      <main className="flex justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t("auth.signup")}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t("auth.signupLead")}</p>

          <div className="mt-6">
            <GoogleLoginButton onSuccess={() => navigate("/dashboard", { replace: true })} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-soft">{t("common.or")}</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field
              label={t("settings.username")}
              htmlFor="signup-username"
              error={errors.username?.message ?? (usernameTaken ? t("auth.usernameTaken") : undefined)}
              success={usernameAvailable ? t("auth.usernameAvailable") : undefined}
              hint={t("auth.usernameHint")}
            >
              <Input
                id="signup-username"
                autoComplete="username"
                hasError={Boolean(errors.username) || usernameTaken}
                {...register("username")}
              />
            </Field>

            <Field label={t("auth.nickname")} htmlFor="signup-nickname" error={errors.nickname?.message} hint={t("auth.nicknameHint")}>
              <Input
                id="signup-nickname"
                autoComplete="nickname"
                hasError={Boolean(errors.nickname)}
                {...register("nickname")}
              />
            </Field>

            <Field
              label={t("auth.password")}
              htmlFor="signup-password"
              error={errors.password?.message}
              hint={t("auth.passwordHint")}
            >
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                hasError={Boolean(errors.password)}
                {...register("password")}
              />
            </Field>

            <Field
              label={t("auth.passwordConfirm")}
              htmlFor="signup-password-confirm"
              error={errors.passwordConfirm?.message}
            >
              <Input
                id="signup-password-confirm"
                type="password"
                autoComplete="new-password"
                hasError={Boolean(errors.passwordConfirm)}
                {...register("passwordConfirm")}
              />
            </Field>

            <div className="mt-1 sm:col-span-2">
              <Button type="submit" className="w-full" isLoading={signupMutation.isPending}>
                {t("auth.signup")}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              {t("landing.login")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
