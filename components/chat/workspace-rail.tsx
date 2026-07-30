"use client";

import { Bell, LogOut, Plus, UserCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User, Workspace } from "@/lib/types";

type WorkspaceRailProps = {
  activeWorkspaceId: number;
  firstChannelByWorkspace: Record<number, number>;
  isLoading?: boolean;
  invitationCount: number;
  onOpenInvitations: () => void;
  onCreateWorkspace: () => void;
  onLogout: () => void;
  currentUser?: User;
  workspaces: Workspace[];
};

export function WorkspaceRail({
  activeWorkspaceId,
  firstChannelByWorkspace,
  isLoading = false,
  invitationCount,
  onOpenInvitations,
  onCreateWorkspace,
  onLogout,
  currentUser,
  workspaces,
}: WorkspaceRailProps) {
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  return (
    <aside className="flex min-h-0 flex-col items-center overflow-hidden border-r border-[#c7c4d8] bg-[#f8faff] px-3 py-5 max-md:h-[46px] max-md:w-full max-md:max-w-full max-md:flex-row max-md:border-b max-md:border-r-0 max-md:px-2 max-md:py-1">
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          title="Workspace invitations"
          aria-label="Workspace invitations"
          onClick={onOpenInvitations}
          className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#c7c4d8] bg-white text-[#3525cd] hover:border-[#3525cd] hover:bg-[#dce9ff] max-md:h-8 max-md:w-8"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {invitationCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#cc2f4a] px-1 text-[11px] font-bold text-white">
              {invitationCount > 9 ? "9+" : invitationCount}
            </span>
          ) : null}
        </button>
      </div>

      <ScrollArea
        orientation="both"
        className="scrollarea-hidden mt-3 w-full flex-1 max-w-full touch-pan-y md:overflow-x-hidden max-md:mx-2 max-md:mt-0 max-md:min-w-0 max-md:max-w-full max-md:touch-pan-x max-md:overflow-x-auto max-md:overflow-y-hidden"
      >
        <div className="flex min-w-0 flex-col items-center gap-3 max-md:min-w-max max-md:flex-row max-md:gap-2">
          {isLoading ? <div className="h-12 w-12 shrink-0 rounded-full bg-[#dce9ff] max-md:h-8 max-md:w-8" /> : null}

          {workspaces.map((workspace) => {
            const firstChannelId = firstChannelByWorkspace[workspace.id] ?? 0;
            const isActive = workspace.id === activeWorkspaceId;

            return (
              <Link
                key={workspace.id}
                href={`/workspaces/${workspace.id}/channels/${firstChannelId}`}
                title={workspace.name}
                aria-label={workspace.name}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-sm font-bold transition max-md:h-8 max-md:w-8 max-md:text-[11px] ${
                  isActive
                    ? "border-[#3525cd] bg-[#3525cd] text-white"
                    : "border-[#c7c4d8] bg-white text-[#3525cd] hover:border-[#3525cd] hover:bg-[#dce9ff]"
                }`}
              >
                {getWorkspaceInitials(workspace.name)}
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <button
        type="button"
        title="Create workspace"
        aria-label="Create workspace"
        onClick={onCreateWorkspace}
        className="mt-3 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-dashed border-[#3525cd] bg-[#dce9ff] text-[#3525cd] hover:bg-[#cfe0ff] max-md:ml-0 max-md:mt-0 max-md:h-8 max-md:w-8"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        title="Profile"
        aria-label="Profile"
        onClick={() => setIsMobileProfileOpen(true)}
        className="ml-2 hidden h-8 w-8 shrink-0 place-items-center rounded-full border border-[#c7c4d8] bg-white text-[#3525cd] shadow-sm max-md:grid"
      >
        <UserAvatar user={currentUser} compact />
      </button>

      <Dialog
        open={isMobileProfileOpen}
        onClose={() => setIsMobileProfileOpen(false)}
        title="Profile"
        description="Account details"
      >
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
          onClick={() => {
            setIsMobileProfileOpen(false);
            onLogout();
          }}
          className="mt-4 flex w-full items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </Button>
      </Dialog>
    </aside>
  );
}

function UserAvatar({ user, compact = false }: { user?: User; compact?: boolean }) {
  const sizeClass = compact ? "h-7 w-7 rounded-full" : "h-10 w-10 rounded-lg";

  if (user?.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className={`${sizeClass} border border-[#c7c4d8] object-cover`}
      />
    );
  }

  return (
    <span className={`grid place-items-center bg-[#dce9ff] text-[#3525cd] ${sizeClass}`}>
      <UserCircle className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden="true" />
    </span>
  );
}

function getWorkspaceInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
