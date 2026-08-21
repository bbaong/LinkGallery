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
import { loginSchema } from "../schema/authSchema";
import type { LoginFormValues } from "../schema/authSchema";
import { useLoginMutation } from "../hooks/useAuthQueries";
import { GoogleLoginButton } from "../components/GoogleLoginButton";

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();

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
      const message = error instanceof ApiRequestError ? error.message : "로그인에 실패했습니다.";
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo />
          <Link to="/signup">
            <Button size="sm">회원가입</Button>
          </Link>
        </PageContainer>
      </header>

      <main className="flex justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">로그인</h1>
          <p className="mt-1 text-sm text-ink-soft">다시 만나서 반가워요.</p>

          <div className="mt-6">
            <GoogleLoginButton onSuccess={() => navigate("/dashboard", { replace: true })} />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink-soft">또는</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="아이디" htmlFor="login-username" error={errors.username?.message}>
              <Input
                id="login-username"
                autoComplete="username"
                hasError={Boolean(errors.username)}
                {...register("username")}
              />
            </Field>

            <Field label="비밀번호" htmlFor="login-password" error={errors.password?.message}>
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
                로그인
              </Button>
            </div>
          </form>

          <p className="mt-6 text-sm text-ink-soft">
            아직 계정이 없으신가요?{" "}
            <Link to="/signup" className="font-medium text-brand-600 hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
