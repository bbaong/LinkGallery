import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../domains/auth/store/authStore";

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
