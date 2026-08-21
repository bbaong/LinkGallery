import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../domains/auth/store/authStore";

export function PublicOnlyRoute() {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
