import { apiClient } from "@/lib/axios";
import type { User } from "@/lib/types";

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export async function getCurrentUser() {
  const response = await apiClient.get<User>("/api/users/me");
  return response.data;
}

export async function getUsers() {
  const response = await apiClient.get<User[]>("/api/users");
  return response.data;
}

export async function registerUser(payload: RegisterRequest) {
  const formData = new FormData();
  formData.append("Username", payload.username);
  formData.append("Email", payload.email);
  formData.append("Password", payload.password);

  const response = await apiClient.post<User>("/api/users", formData);
  return response.data;
}
