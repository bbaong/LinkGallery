import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { useLogoutMutation } from "../hooks/useAuthQueries";
import { Button } from "../../../shared/ui/Button";

export function UserMenu() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      navigate("/", { replace: true });
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    }
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        to="/settings"
        className="hidden text-sm font-medium text-ink hover:text-brand-600 sm:inline"
      >
        {user.nickname}님
      </Link>
      <Button variant="ghost" size="sm" onClick={() => navigate("/settings")} aria-label="설정">
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">설정</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        isLoading={logoutMutation.isPending}
        aria-label="로그아웃"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">로그아웃</span>
      </Button>
    </div>
  );
}
