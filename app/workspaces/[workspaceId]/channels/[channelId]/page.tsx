import dynamic from "next/dynamic";
import { LoadingState } from "@/components/common/state";

const ChatRoomClient = dynamic(
  () => import("@/components/chat/chat-room-client").then((mod) => mod.ChatRoomClient),
  {
    loading: () => (
      <main className="min-h-screen bg-[#f8faff] p-6">
        <LoadingState />
      </main>
    ),
  }
);

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ workspaceId: string; channelId: string }>;
}) {
  const { workspaceId, channelId } = await params;

  return <ChatRoomClient workspaceId={Number(workspaceId)} channelId={Number(channelId)} />;
}
