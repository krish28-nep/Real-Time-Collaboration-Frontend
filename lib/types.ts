export type User = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string | null;
};

export type Workspace = {
  id: number;
  name: string;
  slug: string;
  ownerId: number;
};

export type Channel = {
  id: number;
  name: string;
  slug: string;
  workSpaceId: number;
};

export type MessageReaction = {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  users?: {
    id: number;
    username: string;
    avatarUrl?: string | null;
  }[];
};

export type Message = {
  id: number;
  channelId: number;
  userId: number;
  username: string;
  avatarUrl?: string | null;
  content?: string | null;
  images: string[];
  isDeleted: boolean;
  createdAt: string;
  reactions: MessageReaction[];
};

export type MessageListResponse = {
  items: Message[];
  nextCursor: number | null;
  hasMore: boolean;
};

export type DeletedMessageEvent = {
  id: number;
  channelId: number;
};

export type Invitation = {
  id: number;
  workSpaceId: number;
  workSpaceName?: string | null;
  invitedUserId?: number | null;
  invitedByUserId: number;
  invitedByUsername?: string | null;
  invitedByEmail?: string | null;
  token: string;
  expireAt: string;
  acceptAt?: string | null;
};
