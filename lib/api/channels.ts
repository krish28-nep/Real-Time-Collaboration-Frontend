import { apiClient } from "@/lib/axios";
import type { Channel } from "@/lib/types";

export type ChannelRequest = {
  name: string;
};

export async function getWorkspaceChannels(workspaceId: number) {
  const response = await apiClient.get<Channel[]>(`/api/workspaces/${workspaceId}/channels`);
  return response.data;
}

export async function createWorkspaceChannel(workspaceId: number, payload: ChannelRequest) {
  const response = await apiClient.post<Channel>(`/api/workspaces/${workspaceId}/channels`, payload);
  return response.data;
}

export async function updateWorkspaceChannel(workspaceId: number, channelId: number, payload: ChannelRequest) {
  const response = await apiClient.put<Channel>(`/api/workspaces/${workspaceId}/channels/${channelId}`, payload);
  return response.data;
}

export async function deleteWorkspaceChannel(workspaceId: number, channelId: number) {
  await apiClient.delete(`/api/workspaces/${workspaceId}/channels/${channelId}`);
}
