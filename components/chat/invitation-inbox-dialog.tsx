"use client";

import { Check, Inbox } from "lucide-react";
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
};

export function InvitationInboxDialog({
  acceptingToken,
  invitations,
  isLoading,
  open,
  onAccept,
  onClose,
}: InvitationInboxDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Workspace invitations"
      description="Accept pending invitations from here."
    >
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
            <div>
              <p className="font-bold text-[#262538]">Workspace #{invitation.workSpaceId}</p>
              <p className="text-xs text-[#77758a]">Expires {formatDate(invitation.expireAt)}</p>
            </div>
            <Button
              type="button"
              disabled={acceptingToken === invitation.token}
              onClick={() => onAccept(invitation)}
              className="flex items-center gap-2"
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
