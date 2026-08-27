import { useEffect } from "react";
import type { ReactNode } from "react";
import { useMeQuery } from "../hooks/useAuthQueries";
import { useAuthStore } from "../store/authStore";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isFetched, isError } = useMeQuery();
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    if (!isFetched && !isError) return;
    setUser(isError ? null : data ?? null);
    setInitialized(true);
  }, [isFetched, isError, data, setUser, setInitialized]);

  return <>{children}</>;
}
