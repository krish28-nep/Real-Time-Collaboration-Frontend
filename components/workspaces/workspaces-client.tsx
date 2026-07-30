"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { WorkspaceForm } from "@/components/forms/workspace-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { logoutUser } from "@/lib/api/auth";
import { getWorkspaceChannels } from "@/lib/api/channels";
import { createWorkspace, getWorkspaces } from "@/lib/api/workspaces";
import { getApiErrorMessage } from "@/lib/axios";
import { clearToken } from "@/lib/auth";
import { queryKeys } from "@/lib/query-keys";
import type { Workspace } from "@/lib/types";
import type { WorkspaceFormValues } from "@/lib/validation/workspace";
import { useDebounce } from "@/hooks/use-debounce";

export function WorkspacesClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

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

  const createWorkspaceMutation = useMutation({
    mutationFn: createWorkspace,
    onSuccess: async (workspace) => {
      toast.success("Workspace created", { description: `${workspace.name} is ready.` });
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

  const filteredWorkspaces = useMemo(() => {
    const searchValue = debouncedSearch.trim().toLowerCase();
    const workspaces = workspacesQuery.data || [];

    if (!searchValue) {
      return workspaces;
    }

    return workspaces.filter((workspace) =>
      [workspace.name, workspace.slug].some((value) => value.toLowerCase().includes(searchValue))
    );
  }, [debouncedSearch, workspacesQuery.data]);

  async function logout() {
    await logoutUser().catch(() => undefined);
    clearToken();
    queryClient.clear();
    router.push("/login");
  }

  function handleCreateWorkspace(values: WorkspaceFormValues, reset: () => void) {
    createWorkspaceMutation.mutate(values, {
      onSuccess: reset,
    });
  }

  return (
    <main className="min-h-screen bg-[#f8faff] p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#3525cd]">Workspaces</h1>
            <p className="mt-1 text-sm text-[#464555]">Choose a workspace to open its chat rooms.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/invitations">
              <Button variant="secondary">Invitations</Button>
            </Link>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        <Card className="mb-4 p-4">
          <WorkspaceForm
            isSubmitting={createWorkspaceMutation.isPending}
            onSubmit={handleCreateWorkspace}
          />
        </Card>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search workspaces"
          className="mb-6 w-full"
        />

        {workspacesQuery.isLoading ? <LoadingState /> : null}

        {workspacesQuery.isError ? (
          <ErrorState message={getApiErrorMessage(workspacesQuery.error)} />
        ) : null}

        {!workspacesQuery.isLoading && !workspacesQuery.isError && workspacesQuery.data?.length === 0 ? (
          <EmptyState
            title="Create your first workspace"
            description="You are not joined to any workspace yet. Create one above to start adding channels and chatting."
          />
        ) : null}

        {!workspacesQuery.isLoading && !workspacesQuery.isError && workspacesQuery.data?.length !== 0 && filteredWorkspaces.length === 0 ? (
          <EmptyState
            title="No workspaces found"
            description="Try a different workspace name or slug."
          />
        ) : null}

        <div className="grid gap-3">
          {filteredWorkspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              firstChannelId={firstChannelsQuery.data?.[workspace.id] ?? 0}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function WorkspaceCard({ workspace, firstChannelId }: { workspace: Workspace; firstChannelId: number }) {
  const href = firstChannelId
    ? `/workspaces/${workspace.id}/channels/${firstChannelId}`
    : `/workspaces/${workspace.id}/channels/0`;

  return (
    <Link href={href}>
      <Card className="p-4 transition hover:border-[#3525cd]">
        <h2 className="text-lg font-bold text-[#262538]">{workspace.name}</h2>
        <p className="text-sm text-[#77758a]">/{workspace.slug}</p>
      </Card>
    </Link>
  );
}
