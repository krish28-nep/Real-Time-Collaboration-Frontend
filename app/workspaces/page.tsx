import dynamic from "next/dynamic";
import { LoadingState } from "@/components/common/state";

const WorkspacesClient = dynamic(
  () => import("@/components/workspaces/workspaces-client").then((mod) => mod.WorkspacesClient),
  {
    loading: () => (
      <main className="min-h-screen bg-[#f8faff] p-6">
        <LoadingState />
      </main>
    ),
  }
);

export default function WorkspacesPage() {
  return <WorkspacesClient />;
}
