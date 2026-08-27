import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../domains/auth/store/authStore";
import { Spinner } from "../../shared/ui/Spinner";

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
