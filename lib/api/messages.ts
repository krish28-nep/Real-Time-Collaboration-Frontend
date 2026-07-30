import { apiClient } from "@/lib/axios";
import type { Message, MessageListResponse } from "@/lib/types";

export type CreateMessageRequest = {
  content: string;
  images: string[];
};

export type UpdateReactionRequest = {
  oldEmoji: string;
  newEmoji: string;
};

export async function getChannelMessages(channelId: number, beforeMessageId?: number | null) {
  const response = await apiClient.get<MessageListResponse>(`/api/channels/${channelId}/messages`, {
    params: {
      limit: 30,
      beforeMessageId: beforeMessageId || undefined,
    },
  });
  return response.data;
}

export async function sendChannelMessage(channelId: number, payload: CreateMessageRequest) {
  const response = await apiClient.post<Message>(`/api/channels/${channelId}/messages`, payload);
  return response.data;
}

export async function uploadMessageImages(channelId: number, images: File[]) {
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));

  const response = await apiClient.post<{ images: string[] }>(
    `/api/channels/${channelId}/messages/images`,
    formData
  );
  return response.data;
}

export async function deleteChannelMessage(channelId: number, messageId: number) {
  await apiClient.delete(`/api/channels/${channelId}/messages/${messageId}`);
}

export async function addMessageReaction(messageId: number, emoji: string) {
  await apiClient.post(`/api/messages/${messageId}/reactions`, { emoji });
}

export async function deleteMessageReaction(messageId: number, emoji: string) {
  await apiClient.delete(`/api/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
}

export async function updateMessageReaction(messageId: number, payload: UpdateReactionRequest) {
  await apiClient.patch(`/api/messages/${messageId}/reactions`, payload);
}
