import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { useT } from "../../shared/i18n/useT";

export function NotFoundPage() {
  const { t } = useT();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="text-2xl font-bold text-ink">{t("notFound.title")}</h1>
      <p className="text-ink-soft">{t("notFound.body")}</p>
      <Link to="/">
        <Button>{t("common.home")}</Button>
      </Link>
    </div>
  );
}
