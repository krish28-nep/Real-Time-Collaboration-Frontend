"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getWorkspaceChannels } from "@/lib/api/channels";
import { acceptInvitation, getMyInvitations } from "@/lib/api/invitations";
import { getApiErrorMessage } from "@/lib/axios";
import { queryKeys } from "@/lib/query-keys";
import type { Invitation } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

export function InvitationsClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const invitationsQuery = useQuery({
    queryKey: queryKeys.invitations.me,
    queryFn: getMyInvitations,
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: async (_, token) => {
      const invitation = invitationsQuery.data?.find((item) => item.token === token);
      toast.success("Invitation accepted", { description: "You joined the workspace." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.invitations.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.firstChannels }),
      ]);

      if (invitation) {
        const channels = await getWorkspaceChannels(invitation.workSpaceId);
        router.push(`/workspaces/${invitation.workSpaceId}/channels/${channels[0]?.id ?? 0}`);
      }
    },
    onError: (error) => {
      toast.error("Could not accept invitation", { description: getApiErrorMessage(error) });
    },
  });

  const filteredInvitations = useMemo(() => {
    const invitations = invitationsQuery.data || [];
    const value = debouncedSearch.trim().toLowerCase();

    if (!value) {
      return invitations;
    }

    return invitations.filter((invitation) =>
      [`${invitation.workSpaceId}`, invitation.token].some((item) => item.toLowerCase().includes(value))
    );
  }, [debouncedSearch, invitationsQuery.data]);

  return (
    <main className="min-h-screen bg-[#f8faff] p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#3525cd]">Invitations</h1>
            <p className="mt-1 text-sm text-[#464555]">Accept pending workspace invitations.</p>
          </div>
          <Link href="/workspaces">
            <Button variant="secondary">Workspaces</Button>
          </Link>
        </header>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search invitations"
          className="mb-6 w-full"
        />

        {invitationsQuery.isLoading ? <LoadingState /> : null}

        {invitationsQuery.isError ? (
          <ErrorState message={getApiErrorMessage(invitationsQuery.error)} />
        ) : null}

        {!invitationsQuery.isLoading && !invitationsQuery.isError && invitationsQuery.data?.length === 0 ? (
          <EmptyState
            title="No pending invitations"
            description="When someone invites you, it will show up here."
          />
        ) : null}

        {!invitationsQuery.isLoading && !invitationsQuery.isError && invitationsQuery.data?.length !== 0 && filteredInvitations.length === 0 ? (
          <EmptyState title="No invitations found" description="Try another workspace id or token." />
        ) : null}

        <div className="grid gap-3">
          {filteredInvitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              isAccepting={acceptInvitationMutation.isPending}
              onAccept={() => acceptInvitationMutation.mutate(invitation.token)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function InvitationCard({
  invitation,
  isAccepting,
  onAccept,
}: {
  invitation: Invitation;
  isAccepting: boolean;
  onAccept: () => void;
}) {
  return (
    <Card className="flex items-center justify-between gap-4 p-4 max-sm:flex-col max-sm:items-start">
      <div>
        <h2 className="font-bold text-[#262538]">Workspace #{invitation.workSpaceId}</h2>
        <p className="text-sm text-[#77758a]">Expires {formatDate(invitation.expireAt)}</p>
      </div>
      <Button disabled={isAccepting} onClick={onAccept}>
        {isAccepting ? "Accepting..." : "Accept"}
      </Button>
    </Card>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
