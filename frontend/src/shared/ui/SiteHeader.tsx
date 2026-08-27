import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../domains/auth/store/authStore";
import { UserMenu } from "../../domains/auth/components/UserMenu";
import { LocaleToggle } from "../i18n/LocaleToggle";
import { useT } from "../i18n/useT";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { PageContainer } from "./PageContainer";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const { t } = useT();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b bg-canvas/80 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "border-line shadow-sm" : "border-transparent"
      }`}
    >
      <PageContainer className="flex h-16 items-center justify-between gap-3">
        <Logo to={user ? "/dashboard" : "/"} />
        <div className="flex min-w-0 items-center gap-2">
          <LocaleToggle />
          <ThemeToggle compact className={user ? "max-sm:hidden" : undefined} />
          {isInitialized && user ? (
            <>
              {location.pathname === "/" ? (
                <Link to="/dashboard">
                  <Button size="sm">{t("landing.openApp")}</Button>
                </Link>
              ) : null}
              <UserMenu />
            </>
          ) : null}
          {isInitialized && !user ? (
            location.pathname === "/login" ? (
              <Link to="/signup">
                <Button size="sm">{t("landing.getStarted")}</Button>
              </Link>
            ) : location.pathname === "/signup" ? (
              <Link to="/login">
                <Button size="sm">{t("landing.login")}</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t("landing.login")}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">{t("landing.getStarted")}</Button>
                </Link>
              </>
            )
          ) : null}
        </div>
      </PageContainer>
    </header>
  );
}
