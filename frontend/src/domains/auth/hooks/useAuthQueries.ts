import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "../../../shared/api/client";
import { queryKeys } from "../../../shared/api/queryKeys";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import type { LoginFormValues, SignupFormValues, UpdateEmailFormValues } from "../schema/authSchema";
import { usernameSchema } from "../schema/authSchema";

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        return await authApi.me();
      } catch (error) {
        if (error instanceof ApiRequestError && error.code === "UNAUTHORIZED") {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
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
    mutationFn: (input: UpdateEmailFormValues) => authApi.updateProfile(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me, user);
      useAuthStore.getState().setUser(user);
    },
  });
}
