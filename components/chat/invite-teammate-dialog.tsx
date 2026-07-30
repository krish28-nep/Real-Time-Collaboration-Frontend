"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

type InviteTeammateDialogProps = {
  currentUser?: User;
  isInviting: boolean;
  isLoadingUsers: boolean;
  open: boolean;
  users: User[];
  onClose: () => void;
  onInvite: (userId: number) => void;
};

export function InviteTeammateDialog({
  currentUser,
  isInviting,
  isLoadingUsers,
  open,
  users,
  onClose,
  onInvite,
}: InviteTeammateDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isInviting || !selectedUserId}
            onClick={() => selectedUserId && onInvite(selectedUserId)}
          >
            {isInviting ? "Inviting..." : "Create invite"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
