import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="text-2xl font-bold text-ink">페이지를 찾을 수 없습니다.</h1>
      <p className="text-ink-soft">주소를 다시 확인하거나 홈으로 돌아가주세요.</p>
      <Link to="/">
        <Button>홈으로 가기</Button>
      </Link>
    </div>
  );
}
