"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { ChatSidebar } from "@/components/chat/sidebar";
import { InvitationInboxDialog } from "@/components/chat/invitation-inbox-dialog";
import { InviteTeammateDialog } from "@/components/chat/invite-teammate-dialog";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { WorkspaceRail } from "@/components/chat/workspace-rail";
import {
  createWorkspaceChannel,
  deleteWorkspaceChannel,
  getWorkspaceChannels,
  updateWorkspaceChannel,
} from "@/lib/api/channels";
import { acceptInvitation, createInvitation, getMyInvitations } from "@/lib/api/invitations";
import {
  addMessageReaction,
  deleteChannelMessage,
  deleteMessageReaction,
  getChannelMessages,
  sendChannelMessage,
  uploadMessageImages,
} from "@/lib/api/messages";
import { getCurrentUser, getUsers } from "@/lib/api/users";
import { createWorkspace, getWorkspaces } from "@/lib/api/workspaces";
import { getApiErrorMessage } from "@/lib/axios";
import { clearToken, getToken } from "@/lib/auth";
import { env } from "@/lib/env";
import { queryKeys } from "@/lib/query-keys";
import { Dialog } from "@/components/ui/dialog";
import { WorkspaceForm } from "@/components/forms/workspace-form";
import { logoutUser } from "@/lib/api/auth";
import type { Channel, DeletedMessageEvent, Invitation, Message, MessageListResponse } from "@/lib/types";
import type { ChannelFormValues } from "@/lib/validation/channel";
import type { WorkspaceFormValues } from "@/lib/validation/workspace";

type ChatRoomClientProps = {
  channelId: number;
  workspaceId: number;
};

type HubConnection = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  invoke: (methodName: string, ...args: unknown[]) => Promise<void>;
  on: (eventName: string, callback: (payload: Message | DeletedMessageEvent) => void) => void;
  onclose: (callback: () => void) => void;
  onreconnecting: (callback: () => void) => void;
  onreconnected: (callback: () => void) => void;
};

type HubConnectionBuilder = {
  withUrl: (url: string, options: { accessTokenFactory: () => string }) => HubConnectionBuilder;
  withAutomaticReconnect: () => HubConnectionBuilder;
  build: () => HubConnection;
};

declare global {
  interface Window {
    signalR?: {
      HubConnectionBuilder: new () => HubConnectionBuilder;
    };
  }
}

export function ChatRoomClient({ channelId, workspaceId }: ChatRoomClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("Connecting");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isInvitationInboxOpen, setIsInvitationInboxOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [olderMessagesState, setOlderMessagesState] = useState<{
    channelId: number;
    hasMore: boolean;
    items: Message[];
    nextCursor: number | null;
  }>({
    channelId,
    hasMore: false,
    items: [],
    nextCursor: null,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
  });

  const workspacesQuery = useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: getWorkspaces,
  });

  const firstChannelsQuery = useQuery({
    queryKey: queryKeys.workspaces.firstChannels,
    enabled: Boolean(workspacesQuery.data),
    queryFn: async () => {
      const channelEntries = await Promise.all(
        (workspacesQuery.data || []).map(async (workspace) => {
          const channels = await getWorkspaceChannels(workspace.id);
          return [workspace.id, channels[0]?.id ?? 0] as const;
        })
      );

      return Object.fromEntries(channelEntries) as Record<number, number>;
    },
  });

  const channelsQuery = useQuery({
    queryKey: queryKeys.channels.byWorkspace(workspaceId),
    queryFn: () => getWorkspaceChannels(workspaceId),
  });

  const messagesQuery = useQuery({
    queryKey: queryKeys.messages.byChannel(channelId),
    enabled: channelId > 0,
    queryFn: () => getChannelMessages(channelId),
  });

  const usersQuery = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: getUsers,
    enabled: isInviteOpen,
  });

  const invitationsQuery = useQuery({
    queryKey: queryKeys.invitations.me,
    queryFn: getMyInvitations,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: async (workspace) => {
      toast.success("Workspace created", { description: `${workspace.name} is ready.` });
      setIsCreateWorkspaceOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.firstChannels }),
      ]);

      const channels = await getWorkspaceChannels(workspace.id);
      router.push(`/workspaces/${workspace.id}/channels/${channels[0]?.id ?? 0}`);
    },
    onError: (error) => {
      toast.error("Could not create workspace", { description: getApiErrorMessage(error) });
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: (values: ChannelFormValues) => createWorkspaceChannel(workspaceId, values),
    onSuccess: async (channel) => {
      toast.success("Channel created", { description: `# ${channel.name} is ready.` });
      setIsCreateChannelOpen(false);
      await invalidateChannels();
      router.push(`/workspaces/${workspaceId}/channels/${channel.id}`);
    },
    onError: (error) => {
      toast.error("Could not create channel", { description: getApiErrorMessage(error) });
    },
  });

  const editChannelMutation = useMutation({
    mutationFn: (values: ChannelFormValues) => {
      if (!editingChannel) {
        throw new Error("Choose a channel to edit.");
      }

      return updateWorkspaceChannel(workspaceId, editingChannel.id, values);
    },
    onSuccess: async (channel) => {
      toast.success("Channel updated", { description: `# ${channel.name} was renamed.` });
      setEditingChannel(null);
      await invalidateChannels();
    },
    onError: (error) => {
      toast.error("Could not update channel", { description: getApiErrorMessage(error) });
    },
  });

  const deleteChannelMutation = useMutation({
    mutationFn: (channel: Channel) => deleteWorkspaceChannel(workspaceId, channel.id).then(() => channel),
    onSuccess: async (deletedChannel) => {
      toast.success("Channel deleted", { description: `# ${deletedChannel.name} was removed.` });
      await invalidateChannels();

      if (deletedChannel.id === channelId) {
        const nextChannel = (channelsQuery.data || []).find((channel) => channel.id !== deletedChannel.id);
        router.push(`/workspaces/${workspaceId}/channels/${nextChannel?.id ?? 0}`);
      }
    },
    onError: (error) => {
      toast.error("Could not delete channel", { description: getApiErrorMessage(error) });
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: (invitedUserId: number) => createInvitation({ workSpaceId: workspaceId, invitedUserId }),
    onSuccess: async (invitation) => {
      await navigator.clipboard?.writeText(invitation.token);
      toast.success("Invitation created", { description: "Invitation token copied to clipboard." });
      setIsInviteOpen(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.invitations.me });
    },
    onError: (error) => {
      toast.error("Could not invite user", { description: getApiErrorMessage(error) });
    },
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: (invitation: Invitation) =>
      acceptInvitation(invitation.token).then(() => invitation),
    onSuccess: async (invitation) => {
      toast.success("Invitation accepted", { description: "You joined the workspace." });
      setIsInvitationInboxOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.invitations.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.firstChannels }),
      ]);

      const channels = await getWorkspaceChannels(invitation.workSpaceId);
      router.push(`/workspaces/${invitation.workSpaceId}/channels/${channels[0]?.id ?? 0}`);
    },
    onError: (error) => {
      toast.error("Could not accept invitation", { description: getApiErrorMessage(error) });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, images }: { content: string; images: File[] }) => {
      const uploadedImages = images.length > 0 ? (await uploadMessageImages(channelId, images)).images : [];
      return sendChannelMessage(channelId, { content, images: uploadedImages });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.messages.byChannel(channelId) });
    },
    onError: (error) => {
      toast.error("Could not send message", { description: getApiErrorMessage(error) });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => deleteChannelMessage(channelId, messageId),
    onSuccess: async (_, messageId) => {
      markMessageDeleted(messageId);
      await queryClient.invalidateQueries({ queryKey: queryKeys.messages.byChannel(channelId) });
    },
    onError: (error) => {
      toast.error("Could not delete message", { description: getApiErrorMessage(error) });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: number; emoji: string }) => addMessageReaction(messageId, emoji),
    onSuccess: invalidateMessages,
    onError: (error) => toast.error("Could not add reaction", { description: getApiErrorMessage(error) }),
  });

  const deleteReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: number; emoji: string }) => deleteMessageReaction(messageId, emoji),
    onSuccess: invalidateMessages,
    onError: (error) => toast.error("Could not delete reaction", { description: getApiErrorMessage(error) }),
  });

  const olderMessages = olderMessagesState.channelId === channelId ? olderMessagesState.items : [];
  const nextCursor = olderMessages.length > 0 ? olderMessagesState.nextCursor : messagesQuery.data?.nextCursor;
  const hasMore = olderMessages.length > 0 ? olderMessagesState.hasMore : messagesQuery.data?.hasMore ?? false;
  const messages = [...(messagesQuery.data?.items || []), ...olderMessages];
  const activeChannel = channelsQuery.data?.find((channel) => channel.id === channelId);

  useEffect(() => {
    if (channelsQuery.data && channelId === 0 && channelsQuery.data[0]) {
      router.replace(`/workspaces/${workspaceId}/channels/${channelsQuery.data[0].id}`);
    }
  }, [channelId, channelsQuery.data, router, workspaceId]);

  useEffect(() => {
    if (connectionRef.current && channelId > 0) {
      connectionRef.current.invoke("JoinChannel", channelId).catch(() => setStatus("Offline"));
    }
  }, [channelId]);

  async function connectSignalR() {
    if (!window.signalR || !getToken() || channelId <= 0) {
      return;
    }

    if (connectionRef.current) {
      await connectionRef.current.stop();
    }

    const connection = new window.signalR.HubConnectionBuilder()
      .withUrl(`${env.apiUrl}/api/signalr`, { accessTokenFactory: getToken })
      .withAutomaticReconnect()
      .build();

    connection.on("message.created", (payload) => upsertMessage(payload as Message));
    connection.on("message.deleted", (payload) => markMessageDeleted((payload as DeletedMessageEvent).id));
    connection.on("reaction.created", invalidateMessages);
    connection.on("reaction.deleted", invalidateMessages);
    connection.on("reaction.updated", invalidateMessages);
    connection.onreconnecting(() => setStatus("Reconnecting"));
    connection.onreconnected(() => connection.invoke("JoinChannel", channelId));
    connection.onclose(() => setStatus("Offline"));

    await connection.start();
    await connection.invoke("JoinChannel", channelId);
    connectionRef.current = connection;
    setStatus("Live");
  }

  async function loadOlderMessages() {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const result = await getChannelMessages(channelId, nextCursor);
      setOlderMessagesState((current) => ({
        channelId,
        hasMore: result.hasMore,
        items: current.channelId === channelId ? [...current.items, ...result.items] : result.items,
        nextCursor: result.nextCursor,
      }));
    } catch (error) {
      toast.error("Could not load older messages", { description: getApiErrorMessage(error) });
    } finally {
      setIsLoadingMore(false);
    }
  }

  function invalidateMessages() {
    return queryClient.invalidateQueries({ queryKey: queryKeys.messages.byChannel(channelId) });
  }

  function invalidateChannels() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.channels.byWorkspace(workspaceId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.firstChannels }),
    ]);
  }

  function createChannel(values: ChannelFormValues, reset: () => void) {
    createChannelMutation.mutate(values, {
      onSuccess: reset,
    });
  }

  function editChannel(values: ChannelFormValues, reset: () => void) {
    editChannelMutation.mutate(values, {
      onSuccess: reset,
    });
  }

  function deleteChannel(channel: Channel) {
    const shouldDelete = window.confirm(`Delete #${channel.name}? Messages in this channel will also be removed.`);
    if (!shouldDelete) {
      return;
    }

    deleteChannelMutation.mutate(channel);
  }

  function createNewWorkspace(values: WorkspaceFormValues, reset: () => void) {
    createWorkspaceMutation.mutate(values, {
      onSuccess: reset,
    });
  }

  async function logout() {
    await logoutUser().catch(() => undefined);
    clearToken();
    queryClient.clear();
    router.push("/login");
  }

  function upsertMessage(message: Message) {
    if (message.channelId !== channelId) {
      return;
    }

    queryClient.setQueryData<MessageListResponse>(queryKeys.messages.byChannel(channelId), (current) => {
      if (!current) {
        return current;
      }

      const exists = current.items.some((item) => item.id === message.id);
      return {
        ...current,
        items: exists
          ? current.items.map((item) => (item.id === message.id ? message : item))
          : [message, ...current.items],
      };
    });
  }

  function markMessageDeleted(messageId: number) {
    queryClient.setQueryData<MessageListResponse>(queryKeys.messages.byChannel(channelId), (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((message) =>
          message.id === messageId ? { ...message, isDeleted: true, content: null, images: [] } : message
        ),
      };
    });
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@microsoft/signalr@8.0.7/dist/browser/signalr.min.js"
        onLoad={connectSignalR}
      />

      <main className="grid h-dvh min-h-0 min-w-0 grid-rows-[46px_46px_minmax(0,1fr)] overflow-hidden bg-[#f8faff] text-[#464555] md:grid-cols-[72px_280px_minmax(0,1fr)] md:grid-rows-1">
        <WorkspaceRail
          activeWorkspaceId={workspaceId}
          firstChannelByWorkspace={firstChannelsQuery.data || {}}
          invitationCount={invitationsQuery.data?.length ?? 0}
          isLoading={workspacesQuery.isLoading}
          currentUser={currentUserQuery.data}
          onCreateWorkspace={() => setIsCreateWorkspaceOpen(true)}
          onLogout={logout}
          onOpenInvitations={() => setIsInvitationInboxOpen(true)}
          workspaces={workspacesQuery.data || []}
        />

        <ChatSidebar
          workspaceId={workspaceId}
          channels={channelsQuery.data || []}
          activeChannelId={channelId}
          currentUser={currentUserQuery.data}
          editingChannel={editingChannel}
          isCreatingChannel={createChannelMutation.isPending}
          isDeletingChannel={deleteChannelMutation.isPending}
          isEditingChannel={editChannelMutation.isPending}
          isCreateChannelOpen={isCreateChannelOpen}
          onInviteClick={() => setIsInviteOpen(true)}
          onCreateChannel={createChannel}
          onCreateChannelClose={() => setIsCreateChannelOpen(false)}
          onCreateChannelOpen={() => setIsCreateChannelOpen(true)}
          onDeleteChannel={deleteChannel}
          onEditChannel={editChannel}
          onEditChannelClose={() => setEditingChannel(null)}
          onEditChannelOpen={setEditingChannel}
          onLogout={logout}
        />

        <section className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden md:grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className="flex min-w-0 items-center justify-between gap-3 border-b border-[#e1e6f4] bg-white px-6 py-4 max-md:hidden">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-[#77758a] max-sm:hidden">Chat room</p>
              <h2 className="truncate text-2xl font-bold text-[#262538] max-sm:text-lg"># {activeChannel?.name || "channel"}</h2>
            </div>
            <span className="shrink-0 rounded-lg bg-[#dce9ff] px-3 py-1 text-sm font-semibold text-[#3525cd] max-sm:text-xs">
              {status}
            </span>
          </header>

          <div className="min-h-0 min-w-0 overflow-hidden">
            {messagesQuery.isLoading || channelsQuery.isLoading || currentUserQuery.isLoading ? (
              <div className="h-full min-w-0 overflow-y-auto p-6 max-sm:p-3">
                <LoadingState />
              </div>
            ) : null}

            {messagesQuery.isError || channelsQuery.isError || currentUserQuery.isError ? (
              <div className="h-full min-w-0 overflow-y-auto p-6 max-sm:p-3">
                <ErrorState
                  message={getApiErrorMessage(messagesQuery.error || channelsQuery.error || currentUserQuery.error)}
                />
              </div>
            ) : null}

            {!messagesQuery.isLoading && !messagesQuery.isError && messages.length === 0 ? (
              <div className="h-full min-w-0 overflow-y-auto p-6 max-sm:p-3">
                <EmptyState title="No messages yet" description="Send the first message in this channel." />
              </div>
            ) : null}

            {!messagesQuery.isLoading && !messagesQuery.isError && messages.length > 0 ? (
              <MessageList
                currentUser={currentUserQuery.data}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                messages={messages}
                onLoadOlder={loadOlderMessages}
                onAddReaction={(messageId, emoji) => addReactionMutation.mutate({ messageId, emoji })}
                onDeleteReaction={(messageId, emoji) => deleteReactionMutation.mutate({ messageId, emoji })}
                onDeleteMessage={(messageId) => deleteMessageMutation.mutate(messageId)}
              />
            ) : null}
          </div>

          <MessageComposer
            isSending={sendMessageMutation.isPending}
            onSend={(content, images) => sendMessageMutation.mutate({ content, images })}
          />
        </section>
      </main>

      <InviteTeammateDialog
        currentUser={currentUserQuery.data}
        isInviting={createInviteMutation.isPending}
        isLoadingUsers={usersQuery.isLoading}
        open={isInviteOpen}
        users={usersQuery.data || []}
        onClose={() => setIsInviteOpen(false)}
        onInvite={(userId) => createInviteMutation.mutate(userId)}
      />

      <InvitationInboxDialog
        acceptingToken={acceptInvitationMutation.variables?.token}
        invitations={invitationsQuery.data || []}
        isLoading={invitationsQuery.isLoading}
        open={isInvitationInboxOpen}
        onAccept={(invitation) => acceptInvitationMutation.mutate(invitation)}
        onClose={() => setIsInvitationInboxOpen(false)}
      />

      <Dialog
        open={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        title="Create workspace"
        description="Start a new workspace."
      >
        <WorkspaceForm
          isSubmitting={createWorkspaceMutation.isPending}
          onSubmit={createNewWorkspace}
        />
      </Dialog>
    </>
  );
}
