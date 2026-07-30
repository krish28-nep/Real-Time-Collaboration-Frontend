"use client";

import { Edit2, LogOut, Plus, Trash2, UserCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChannelForm } from "@/components/forms/channel-form";
import { Dialog } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Channel, User } from "@/lib/types";
import type { ChannelFormValues } from "@/lib/validation/channel";

type ChatSidebarProps = {
  workspaceId: number;
  channels: Channel[];
  activeChannelId?: number;
  currentUser?: User;
  editingChannel?: Channel | null;
  isCreatingChannel?: boolean;
  isDeletingChannel?: boolean;
  isEditingChannel?: boolean;
  isCreateChannelOpen?: boolean;
  onInviteClick?: () => void;
  onCreateChannel?: (values: ChannelFormValues, reset: () => void) => void;
  onCreateChannelClose?: () => void;
  onCreateChannelOpen?: () => void;
  onDeleteChannel?: (channel: Channel) => void;
  onEditChannel?: (values: ChannelFormValues, reset: () => void) => void;
  onEditChannelClose?: () => void;
  onEditChannelOpen?: (channel: Channel) => void;
  onLogout?: () => void;
};

export function ChatSidebar({
  workspaceId,
  channels,
  activeChannelId,
  currentUser,
  editingChannel,
  isCreatingChannel = false,
  isDeletingChannel = false,
  isEditingChannel = false,
  isCreateChannelOpen = false,
  onInviteClick,
  onCreateChannel,
  onCreateChannelClose,
  onCreateChannelOpen,
  onDeleteChannel,
  onEditChannel,
  onEditChannelClose,
  onEditChannelOpen,
  onLogout,
}: ChatSidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    function closeProfileMenu(event: MouseEvent) {
      if (profileMenuRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsProfileOpen(false);
    }

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, [isProfileOpen]);

  return (
    <>
      <aside className="flex min-h-0 flex-col justify-between overflow-hidden border-r border-[#c7c4d8] bg-[#eff4ff] px-4 py-6 max-md:h-[46px] max-md:w-full max-md:max-w-full max-md:flex-row max-md:items-center max-md:border-b max-md:border-r-0 max-md:px-2 max-md:py-1">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col max-md:flex-row max-md:items-center max-md:gap-2">
          <div className="px-2 pb-8 max-md:hidden">
            <div className="flex items-center gap-2">
              <div className="text-[32px] leading-none text-[#3525cd]">✣</div>
              <h1 className="text-2xl font-bold leading-8 text-[#3525cd]">Next Chat</h1>
            </div>
            <p className="ml-1 mt-0.5 text-sm font-medium">Workspace Chat</p>
          </div>

          <div className="mb-2 flex items-center justify-between px-2 max-md:mb-0 max-md:px-0">
            <p className="text-xs font-semibold uppercase text-[#77758a] max-md:hidden">Channels</p>
            <button
              type="button"
              title="Create channel"
              aria-label="Create channel"
              onClick={onCreateChannelOpen}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#3525cd] hover:bg-[#dce9ff] max-md:h-8 max-md:w-8 max-md:bg-white/70"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <ScrollArea
            orientation="both"
            className="flex-1 max-w-full touch-pan-y md:overflow-x-hidden max-md:min-w-0 max-md:max-w-full max-md:flex-1 max-md:touch-pan-x max-md:overflow-x-auto max-md:overflow-y-hidden"
          >
            <nav className="flex min-w-0 flex-col gap-1 pr-1 max-md:min-w-max max-md:flex-row max-md:gap-2 max-md:pr-0">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`group flex min-h-9 items-center gap-1 rounded-lg px-2 max-md:h-8 max-md:min-h-8 max-md:shrink-0 max-md:rounded-full max-md:px-3 ${
                    activeChannelId === channel.id
                      ? "bg-[#dce9ff] text-[#3525cd]"
                      : "text-[#464555] hover:bg-[#dce9ff]/70"
                  }`}
                >
                  <Link
                    href={`/workspaces/${workspaceId}/channels/${channel.id}`}
                    className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left text-sm font-medium max-md:max-w-36 max-md:gap-1 max-md:py-1"
                  >
                    <span className="w-5 text-center text-xl max-md:w-auto max-md:text-sm">#</span>
                    <span className="truncate">{channel.name}</span>
                  </Link>
                  <button
                    type="button"
                    title="Edit channel"
                    aria-label={`Edit ${channel.name}`}
                    onClick={() => onEditChannelOpen?.(channel)}
                    className="grid h-8 w-8 place-items-center rounded-lg opacity-80 hover:bg-white/70 max-md:hidden"
                  >
                    <Edit2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    title="Delete channel"
                    aria-label={`Delete ${channel.name}`}
                    disabled={isDeletingChannel}
                    onClick={() => onDeleteChannel?.(channel)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[#cc2f4a] opacity-80 hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40 max-md:hidden"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </div>

        <div ref={profileMenuRef} className="relative flex flex-col gap-3 border-t border-[#c7c4d8] pt-6 max-md:hidden">
          <Button type="button" onClick={onInviteClick}>
            Invite Teammates
          </Button>

          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="flex min-h-11 items-center gap-3 rounded-lg bg-white px-3 py-2 text-left text-sm font-semibold text-[#262538] shadow-sm hover:bg-[#dce9ff]"
          >
            <UserAvatar user={currentUser} />
            <span className="min-w-0 flex-1 truncate">{currentUser?.username || "User"}</span>
          </button>

          {isProfileOpen ? (
            <div className="absolute bottom-16 left-0 z-30 w-full rounded-lg border border-[#c7c4d8] bg-white p-3 shadow-xl">
              <div className="flex items-start gap-3">
                <UserAvatar user={currentUser} />
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#262538]">{currentUser?.username || "User"}</p>
                  <p className="truncate text-xs text-[#77758a]">{currentUser?.email || "No email found"}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="danger"
                onClick={onLogout}
                className="mt-3 flex w-full items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </Button>
            </div>
          ) : null}
        </div>
      </aside>

      <Dialog
        open={isCreateChannelOpen}
        onClose={onCreateChannelClose || (() => undefined)}
        title="Create channel"
        description="Add a channel to this workspace."
      >
        <ChannelForm
          isSubmitting={isCreatingChannel}
          submitLabel="Create channel"
          onCancel={onCreateChannelClose}
          onSubmit={onCreateChannel || (() => undefined)}
        />
      </Dialog>

      <Dialog
        open={Boolean(editingChannel)}
        onClose={onEditChannelClose || (() => undefined)}
        title="Edit channel"
        description="Rename this channel."
      >
        <ChannelForm
          defaultName={editingChannel?.name}
          isSubmitting={isEditingChannel}
          submitLabel="Save changes"
          onCancel={onEditChannelClose}
          onSubmit={onEditChannel || (() => undefined)}
        />
      </Dialog>
    </>
  );
}

function UserAvatar({ user }: { user?: User }) {
  if (user?.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className="h-9 w-9 rounded-lg border border-[#c7c4d8] object-cover"
      />
    );
  }

  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#dce9ff] text-[#3525cd]">
      <UserCircle className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}
