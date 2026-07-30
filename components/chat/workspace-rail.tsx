"use client";

import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import type { Workspace } from "@/lib/types";

type WorkspaceRailProps = {
  activeWorkspaceId: number;
  firstChannelByWorkspace: Record<number, number>;
  isLoading?: boolean;
  invitationCount: number;
  onOpenInvitations: () => void;
  onCreateWorkspace: () => void;
  workspaces: Workspace[];
};

export function WorkspaceRail({
  activeWorkspaceId,
  firstChannelByWorkspace,
  isLoading = false,
  invitationCount,
  onOpenInvitations,
  onCreateWorkspace,
  workspaces,
}: WorkspaceRailProps) {
  return (
    <aside className="flex min-h-screen flex-col items-center gap-3 border-r border-[#c7c4d8] bg-[#f8faff] px-3 py-5 max-md:min-h-fit max-md:flex-row max-md:overflow-auto">
      <button
        type="button"
        title="Workspace invitations"
        aria-label="Workspace invitations"
        onClick={onOpenInvitations}
        className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#c7c4d8] bg-white text-[#3525cd] hover:border-[#3525cd] hover:bg-[#dce9ff]"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {invitationCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#cc2f4a] px-1 text-[11px] font-bold text-white">
            {invitationCount > 9 ? "9+" : invitationCount}
          </span>
        ) : null}
      </button>

      {isLoading ? <div className="h-12 w-12 rounded-full bg-[#dce9ff]" /> : null}

      {workspaces.map((workspace) => {
        const firstChannelId = firstChannelByWorkspace[workspace.id] ?? 0;
        const isActive = workspace.id === activeWorkspaceId;

        return (
          <Link
            key={workspace.id}
            href={`/workspaces/${workspace.id}/channels/${firstChannelId}`}
            title={workspace.name}
            aria-label={workspace.name}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border text-sm font-bold transition ${
              isActive
                ? "border-[#3525cd] bg-[#3525cd] text-white"
                : "border-[#c7c4d8] bg-white text-[#3525cd] hover:border-[#3525cd] hover:bg-[#dce9ff]"
            }`}
          >
            {getWorkspaceInitials(workspace.name)}
          </Link>
        );
      })}

      <button
        type="button"
        title="Create workspace"
        aria-label="Create workspace"
        onClick={onCreateWorkspace}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-dashed border-[#3525cd] bg-[#dce9ff] text-[#3525cd] hover:bg-[#cfe0ff]"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>
    </aside>
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
