import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { Logo } from "../../../shared/ui/Logo";
import { Field } from "../../../shared/ui/Field";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { ApiRequestError } from "../../../shared/api/client";
import { UserMenu } from "../components/UserMenu";
import { useAuthStore } from "../store/authStore";
import { updateEmailSchema } from "../schema/authSchema";
import type { UpdateEmailFormValues } from "../schema/authSchema";
import { useUpdateProfileMutation } from "../hooks/useAuthQueries";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const updateProfileMutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEmailFormValues>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: { email: user?.email ?? "" },
  });

  useEffect(() => {
    reset({ email: user?.email ?? "" });
  }, [reset, user?.email]);

  async function onSubmit(values: UpdateEmailFormValues) {
    try {
      await updateProfileMutation.mutateAsync(values);
      toast.success("이메일이 저장되었습니다.");
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : "이메일 저장에 실패했습니다.";
      toast.error(message);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <header className="border-b border-line bg-canvas/80 backdrop-blur">
        <PageContainer className="flex h-16 items-center justify-between">
          <Logo />
          <UserMenu />
        </PageContainer>
      </header>

      <PageContainer className="max-w-lg pt-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-8 shadow-sm">
          <div>
            <h1 className="text-xl font-semibold text-ink">설정</h1>
            <p className="mt-1 text-sm text-ink-soft">계정 정보를 관리할 수 있습니다.</p>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="아이디" htmlFor="settings-username">
              <Input id="settings-username" value={user.username} readOnly className="bg-canvas text-ink-soft" />
            </Field>

            <Field label="닉네임" htmlFor="settings-nickname">
              <Input id="settings-nickname" value={user.nickname} readOnly className="bg-canvas text-ink-soft" />
            </Field>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Field
                label="이메일"
                htmlFor="settings-email"
                optional={!user.email}
                error={errors.email?.message}
                hint={user.email ? "로그인에는 사용되지 않습니다." : "나중에 계정 찾기에 사용할 수 있습니다."}
              >
                <Input
                  id="settings-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  hasError={Boolean(errors.email)}
                  {...register("email")}
                />
              </Field>

              <Button type="submit" className="w-full sm:w-auto" isLoading={updateProfileMutation.isPending}>
                이메일 저장
              </Button>
            </form>
          </div>

          <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:underline">
            대시보드로 돌아가기
          </Link>
        </div>
      </PageContainer>
    </div>
  );
}
