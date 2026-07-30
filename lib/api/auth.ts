import { apiClient } from "@/lib/axios";

export type LoginRequest = {
  user: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export async function loginUser(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", payload);
  return response.data;
}

export async function logoutUser() {
  await apiClient.post("/api/auth/logout");
}
