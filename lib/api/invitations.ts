import { apiClient } from "@/lib/axios";
import type { Invitation } from "@/lib/types";

export type CreateInvitationRequest = {
  workSpaceId: number;
  invitedUserId: number;
};

export async function getMyInvitations() {
  const response = await apiClient.get<Invitation[]>("/api/invitations/me");
  return response.data;
}

export async function createInvitation(payload: CreateInvitationRequest) {
  const response = await apiClient.post<Invitation>("/api/invitations", payload);
  return response.data;
}

export async function acceptInvitation(token: string) {
  const response = await apiClient.post<{ message: string }>(`/api/invitations/join/${token}`);
  return response.data;
}
