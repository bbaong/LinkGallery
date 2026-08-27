import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Field } from "../../../shared/ui/Field";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { SiteHeader } from "../../../shared/ui/SiteHeader";
import { ApiRequestError } from "../../../shared/api/client";
import { loginSchema } from "../schema/authSchema";
import type { LoginFormValues } from "../schema/authSchema";
import { useLoginMutation } from "../hooks/useAuthQueries";
import { GoogleLoginButton } from "../components/GoogleLoginButton";
import { useT } from "../../../shared/i18n/useT";
import { AmbientGlow } from "../../../shared/ui/AmbientGlow";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const { t } = useT();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(values);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : t("auth.loginFailed");
      toast.error(message);
    }
  }

  return (
    <div className="relative min-h-screen bg-canvas">
      <SiteHeader />
      <AmbientGlow />

      <main className="relative flex justify-center px-4 pb-16 pt-28 sm:pt-32">
        <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t("landing.login")}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t("auth.welcomeBack")}</p>

          <div className="mt-6">
            <GoogleLoginButton onSuccess={() => navigate("/dashboard", { replace: true })} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-soft">{t("common.or")}</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label={t("settings.username")} htmlFor="login-username" error={errors.username?.message}>
              <Input
                id="login-username"
                autoComplete="username"
                hasError={Boolean(errors.username)}
                {...register("username")}
              />
            </Field>

            <Field label={t("auth.password")} htmlFor="login-password" error={errors.password?.message}>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                hasError={Boolean(errors.password)}
                {...register("password")}
              />
            </Field>

            <div className="mt-1 sm:col-span-2">
              <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
                {t("landing.login")}
              </Button>
            </div>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            {t("auth.noAccount")}{" "}
            <Link to="/signup" className="font-medium text-brand-600 hover:underline">
              {t("auth.signup")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
