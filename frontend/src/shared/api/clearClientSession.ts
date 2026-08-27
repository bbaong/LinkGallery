import { useAuthStore } from "../../domains/auth/store/authStore";
import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

export function clearClientSession() {
  useAuthStore.getState().setUser(null);
  queryClient.setQueryData(queryKeys.auth.me, null);
}
