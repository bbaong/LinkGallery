import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import type { LoginFormValues, SignupFormValues } from "../schema/authSchema";
import type { UpdateProfileInput } from "../api/authApi";
import { usernameSchema } from "../schema/authSchema";

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 30_000,
  });
}

export function useSignupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupFormValues) => authApi.signup(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      useAuthStore.getState().setUser(user);
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginFormValues) => authApi.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      useAuthStore.getState().setUser(user);
    },
  });
}

export function useGoogleLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { idToken: string }) => authApi.google(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      useAuthStore.getState().setUser(user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      useAuthStore.getState().setUser(null);
      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.clear();
    },
  });
}

export function useUsernameAvailableQuery(username: string) {
  const parsed = usernameSchema.safeParse(username);
  const normalized = parsed.success ? parsed.data : "";

  return useQuery({
    queryKey: queryKeys.auth.usernameAvailable(normalized),
    queryFn: () => authApi.checkUsername(normalized),
    enabled: parsed.success,
    staleTime: 30_000,
    retry: false,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => authApi.updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      useAuthStore.getState().setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
}

export function useResetWorkspaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.resetWorkspace,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      useAuthStore.getState().setUser(user);
      queryClient.invalidateQueries({ queryKey: queryKeys.folders.all });
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      useAuthStore.getState().setUser(null);
      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.clear();
    },
  });
}
