"use client";

import { Check, Inbox, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Invitation } from "@/lib/types";

type InvitationInboxDialogProps = {
  acceptingToken?: string;
  invitations: Invitation[];
  isLoading: boolean;
  open: boolean;
  onAccept: (invitation: Invitation) => void;
  onClose: () => void;
  onInviteClick?: () => void;
};

export function InvitationInboxDialog({
  acceptingToken,
  invitations,
  isLoading,
  open,
  onAccept,
  onClose,
  onInviteClick,
}: InvitationInboxDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Workspace invitations"
      description="Accept pending invitations from here."
    >
      {onInviteClick ? (
        <div className="mb-3 flex justify-end">
          <Button type="button" onClick={onInviteClick} className="flex items-center gap-2 max-sm:w-full max-sm:justify-center">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invite teammate
          </Button>
        </div>
      ) : null}

      {isLoading ? <p className="text-sm text-[#77758a]">Loading invitations...</p> : null}

      {!isLoading && invitations.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-[#e1e6f4] p-6 text-center">
          <Inbox className="h-8 w-8 text-[#77758a]" aria-hidden="true" />
          <p className="mt-2 font-semibold text-[#262538]">No pending invitations</p>
          <p className="mt-1 text-sm text-[#77758a]">New workspace invites will show up here.</p>
        </div>
      ) : null}

      <div className="grid gap-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-[#e1e6f4] p-3 max-sm:flex-col max-sm:items-start"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#dce9ff] text-[#3525cd]">
                <UserPlus className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-[#262538]">
                  {invitation.workSpaceName || `Workspace #${invitation.workSpaceId}`}
                </p>
                <p className="truncate text-xs text-[#77758a]">
                  Invited by {invitation.invitedByUsername || invitation.invitedByEmail || `User #${invitation.invitedByUserId}`}
                </p>
                <p className="text-xs text-[#77758a]">Expires {formatDate(invitation.expireAt)}</p>
              </div>
            </div>
            <Button
              type="button"
              disabled={acceptingToken === invitation.token}
              onClick={() => onAccept(invitation)}
              className="flex items-center gap-2 max-sm:w-full max-sm:justify-center"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {acceptingToken === invitation.token ? "Accepting..." : "Accept"}
            </Button>
          </div>
        ))}
      </div>
    </Dialog>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
