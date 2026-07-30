export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  users: {
    all: ["users"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    firstChannels: ["workspaces", "first-channels"] as const,
  },
  channels: {
    byWorkspace: (workspaceId: number) => ["workspaces", workspaceId, "channels"] as const,
  },
  messages: {
    byChannel: (channelId: number) => ["channels", channelId, "messages"] as const,
  },
  invitations: {
    me: ["invitations", "me"] as const,
  },
};
