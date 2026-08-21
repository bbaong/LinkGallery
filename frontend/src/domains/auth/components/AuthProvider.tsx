import { useEffect } from "react";
import type { ReactNode } from "react";
import { useMeQuery } from "../hooks/useAuthQueries";
import { useAuthStore } from "../store/authStore";
import { Spinner } from "../../../shared/ui/Spinner";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isFetched } = useMeQuery();
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (!isFetched) return;
    setUser(data ?? null);
    setInitialized(true);
  }, [isFetched, data, setUser, setInitialized]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
