import dynamic from "next/dynamic";
import { LoadingState } from "@/components/common/state";

const InvitationsClient = dynamic(
  () => import("@/components/invitations-client").then((mod) => mod.InvitationsClient),
  {
    loading: () => (
      <main className="min-h-screen bg-[#f8faff] p-6">
        <LoadingState />
      </main>
    ),
  }
);

export default function InvitationsPage() {
  return <InvitationsClient />;
}
