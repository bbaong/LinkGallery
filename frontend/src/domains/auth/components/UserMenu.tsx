import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../store/authStore";
import { useLogoutMutation } from "../hooks/useAuthQueries";
import { ThemeToggle } from "../../../shared/ui/ThemeToggle";
import { UserAvatar } from "../../../shared/ui/UserAvatar";
import { useT } from "../../../shared/i18n/useT";

export function UserMenu() {
  const { t, locale } = useT();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>(0);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function openMenu() {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  }

  async function handleLogout() {
    setOpen(false);
    try {
      await logoutMutation.mutateAsync();
      navigate("/", { replace: true });
    } catch {
      toast.error(t("menu.logoutFailed"));
    }
  }

  if (!user) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <ThemeToggle compact />
      <div
        ref={rootRef}
        className="relative"
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-bold text-ink transition-colors hover:bg-canvas"
        >
          <UserAvatar nickname={user.nickname} avatarUrl={user.avatarUrl} avatarType={user.avatarType} avatarValue={user.avatarValue} size="md" />
          <span className="hidden max-w-[8rem] truncate sm:inline">
            {locale === "en" ? user.nickname : `${user.nickname}님`}
          </span>
          <ChevronDown className={`h-4 w-4 text-ink-soft transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 w-44 pt-1.5"
          >
            <div className="overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-xl">
              <Link
                role="menuitem"
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-canvas"
              >
                <UserRound className="h-4 w-4 text-ink-soft" />
                {t("menu.profile")}
              </Link>
              <Link
                role="menuitem"
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-canvas"
              >
                <Settings className="h-4 w-4 text-ink-soft" />
                {t("menu.settings")}
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-ink hover:bg-canvas"
              >
                <LogOut className="h-4 w-4 text-ink-soft" />
                {t("menu.logout")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
