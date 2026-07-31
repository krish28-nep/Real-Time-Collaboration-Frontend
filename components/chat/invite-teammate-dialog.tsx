"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

type InviteTeammateDialogProps = {
  currentUser?: User;
  invitationToken?: string | null;
  isInviting: boolean;
  isLoadingUsers: boolean;
  open: boolean;
  users: User[];
  onClose: () => void;
  onInvite: (userId: number) => void;
};

export function InviteTeammateDialog({
  currentUser,
  invitationToken,
  isInviting,
  isLoadingUsers,
  open,
  users,
  onClose,
  onInvite,
}: InviteTeammateDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);
  const didCopyToken = Boolean(invitationToken && copiedToken === invitationToken);

  const inviteableUsers = useMemo(() => {
    const value = debouncedSearch.trim().toLowerCase();
    return users
      .filter((user) => user.id !== currentUser?.id)
      .filter((user) => !value || [user.username, user.email].some((field) => field.toLowerCase().includes(value)));
  }, [currentUser?.id, debouncedSearch, users]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Invite teammate"
      description="Choose a user and create a workspace invitation."
    >
      <div className="space-y-3">
        {invitationToken ? (
          <div className="rounded-lg border border-[#c7c4d8] bg-[#f8faff] p-3">
            <p className="text-sm font-bold text-[#262538]">Invitation token</p>
            <div className="mt-2 flex min-w-0 items-center gap-2 max-sm:flex-col max-sm:items-stretch">
              <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#464555]">
                {invitationToken}
              </code>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard?.writeText(invitationToken);
                  setCopiedToken(invitationToken);
                }}
                className="flex items-center justify-center gap-2 max-sm:w-full"
              >
                {didCopyToken ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {didCopyToken ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ) : null}

        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />

        <div className="max-h-72 overflow-auto rounded-lg border border-[#e1e6f4]">
          {inviteableUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
              className={`flex w-full items-center justify-between gap-3 border-b border-[#e1e6f4] px-3 py-2 text-left last:border-b-0 ${
                selectedUserId === user.id ? "bg-[#dce9ff]" : "bg-white hover:bg-[#eff4ff]"
              }`}
            >
              <span>
                <strong className="block text-[#262538]">{user.username}</strong>
                <span className="text-sm text-[#77758a]">{user.email}</span>
              </span>
              {selectedUserId === user.id ? (
                <span className="text-sm font-semibold text-[#3525cd]">Selected</span>
              ) : null}
            </button>
          ))}
        </div>

        {isLoadingUsers ? <p className="text-sm text-[#77758a]">Loading users...</p> : null}

        {!isLoadingUsers && inviteableUsers.length === 0 ? (
          <p className="text-sm text-[#77758a]">
            {currentUser ? "No matching users found." : "No users found."}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 max-sm:flex-col-reverse">
          <Button type="button" variant="ghost" onClick={onClose} className="max-sm:w-full">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isInviting || !selectedUserId}
            onClick={() => selectedUserId && onInvite(selectedUserId)}
            className="max-sm:w-full"
          >
            {isInviting ? "Inviting..." : "Create invite"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
