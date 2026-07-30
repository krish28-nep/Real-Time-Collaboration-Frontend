import { apiClient } from "@/lib/axios";
import type { Workspace } from "@/lib/types";

export type CreateWorkspaceRequest = {
  name: string;
};

export async function getWorkspaces() {
  const response = await apiClient.get<Workspace[]>("/api/workspaces");
  return response.data;
}

export async function createWorkspace(payload: CreateWorkspaceRequest) {
  const response = await apiClient.post<Workspace>("/api/workspaces", payload);
  return response.data;
}
