"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { env } from "@/lib/env";
import type { Message, User } from "@/lib/types";

type MessageListProps = {
  currentUser?: User;
  hasMore: boolean;
  isLoadingMore: boolean;
  messages: Message[];
  onLoadOlder: () => void;
  onAddReaction: (messageId: number, emoji: string) => void;
  onDeleteReaction: (messageId: number, emoji: string) => void;
  onEditReaction: (messageId: number) => void;
  onDeleteMessage: (messageId: number) => void;
};

export function MessageList({
  currentUser,
  hasMore,
  isLoadingMore,
  messages,
  onLoadOlder,
  onAddReaction,
  onDeleteReaction,
  onEditReaction,
  onDeleteMessage,
}: MessageListProps) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden px-6 py-4">
      <Button
        type="button"
        variant="secondary"
        disabled={!hasMore || isLoadingMore}
        onClick={onLoadOlder}
        className="mx-auto mb-3"
      >
        {isLoadingMore ? "Loading..." : "Load older"}
      </Button>

      <div className="flex min-h-0 flex-col gap-3 overflow-auto">
        {messages.map((message) => {
          const isMine = currentUser?.id === message.userId;

          return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <Card
                className={`grid max-w-[75%] gap-3 p-3 max-sm:max-w-[92%] ${
                  isMine
                    ? "grid-cols-[minmax(0,1fr)_40px] bg-[#dce9ff]"
                    : "grid-cols-[40px_minmax(0,1fr)] bg-white"
                }`}
              >
                {!isMine ? <Avatar name={message.username} /> : null}

                <div className={isMine ? "text-right" : ""}>
                  <div className={`mb-1 flex items-center gap-2 ${isMine ? "justify-end" : "justify-between"}`}>
                    <strong className="text-[#262538]">{isMine ? "You" : message.username || "Unknown"}</strong>
                    <span className="text-xs text-[#77758a]">{formatTime(message.createdAt)}</span>
                  </div>

                  <p className={message.isDeleted ? "italic text-[#77758a]" : "whitespace-pre-wrap"}>
                    {message.isDeleted ? "This message was deleted." : message.content}
                  </p>

                  {!message.isDeleted && message.images.length > 0 ? (
                    <div className={`mt-3 grid gap-2 ${message.images.length > 1 ? "grid-cols-2" : ""}`}>
                      {message.images.map((image) => (
                        <a
                          key={image}
                          href={resolveAssetUrl(image)}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-lg border border-[#c7c4d8] bg-white"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveAssetUrl(image)}
                            alt="Message attachment"
                            className="max-h-72 w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  ) : null}

                  <div className={`mt-2 flex flex-wrap gap-1 ${isMine ? "justify-end" : ""}`}>
                    {message.reactions.map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        type="button"
                        variant={reaction.reactedByMe ? "secondary" : "ghost"}
                        onClick={() => onDeleteReaction(message.id, reaction.emoji)}
                        className="px-2 py-1"
                      >
                        {reaction.emoji} {reaction.count}
                      </Button>
                    ))}
                  </div>

                  <div className={`mt-2 flex flex-wrap gap-1 ${isMine ? "justify-end" : ""}`}>
                    {["👍", "❤️", "😂"].map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        onClick={() => onAddReaction(message.id, emoji)}
                        className="px-2 py-1"
                      >
                        {emoji}
                      </Button>
                    ))}
                    <Button type="button" variant="ghost" onClick={() => onEditReaction(message.id)} className="px-2 py-1">
                      Edit reaction
                    </Button>
                    <Button type="button" variant="danger" onClick={() => onDeleteMessage(message.id)} className="px-2 py-1">
                      Delete
                    </Button>
                  </div>
                </div>

                {isMine ? <Avatar name={currentUser?.username || message.username} /> : null}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Avatar({ name }: { name?: string }) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#3525cd] font-bold text-white">
      {(name || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

function resolveAssetUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  return `${env.apiUrl}${url}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
