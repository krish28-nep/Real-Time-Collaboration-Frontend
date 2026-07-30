import axios, { AxiosError } from "axios";
import { clearToken, getToken } from "@/lib/auth";
import { env } from "@/lib/env";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && typeof window !== "undefined") {
      clearToken();

      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return readAxiosError(error);
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}

function readAxiosError(error: AxiosError<{ message?: string } | string>) {
  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object" && "message" in data && data.message) {
    return data.message;
  }

  return error.message || "Request failed.";
}
