"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Plus, Trash2 } from "lucide-react";
import { TouchEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageImageGallery } from "@/components/chat/message-image-gallery";
import { Dialog } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  onDeleteMessage: (messageId: number) => void;
};

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];
const MAX_VISIBLE_REACTIONS = 3;

export function MessageList({
  currentUser,
  hasMore,
  isLoadingMore,
  messages,
  onLoadOlder,
  onAddReaction,
  onDeleteReaction,
  onDeleteMessage,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const [reactionDetailsMessageId, setReactionDetailsMessageId] = useState<number | null>(null);
  const [emojiPickerMessageId, setEmojiPickerMessageId] = useState<number | null>(null);
  const [activeActionMessageId, setActiveActionMessageId] = useState<number | null>(null);
  const orderedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const reactionDetailsMessage = useMemo(
    () => messages.find((message) => message.id === reactionDetailsMessageId) ?? null,
    [messages, reactionDetailsMessageId]
  );
  const emojiPickerMessage = useMemo(
    () => messages.find((message) => message.id === emojiPickerMessageId) ?? null,
    [messages, emojiPickerMessageId]
  );
  const activeActionMessage = useMemo(
    () => messages.find((message) => message.id === activeActionMessageId) ?? null,
    [messages, activeActionMessageId]
  );
  const latestMessageId = messages[0]?.id;

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    });

    return () => cancelAnimationFrame(frameId);
  }, [latestMessageId]);

  useEffect(() => {
    return () => clearLongPressTimer();
  }, []);

  function clearLongPressTimer() {
    if (!longPressTimerRef.current) {
      return;
    }

    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  }

  function startLongPress(messageId: number) {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setActiveActionMessageId(messageId);
    }, 450);
  }

  function endLongPress(event: TouchEvent) {
    clearLongPressTimer();

    if (!longPressTriggeredRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    longPressTriggeredRef.current = false;
  }

  function cancelLongPress() {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
  }

  function toggleReaction(message: Message, emoji: string) {
    const existingReaction = message.reactions.find((reaction) => reaction.emoji === emoji);

    if (existingReaction?.reactedByMe) {
      onDeleteReaction(message.id, emoji);
      return;
    }

    onAddReaction(message.id, emoji);
  }

  function chooseEmoji(selectedEmoji: { native?: string }) {
    if (!emojiPickerMessage || !selectedEmoji.native) {
      return;
    }

    toggleReaction(emojiPickerMessage, selectedEmoji.native);
    setEmojiPickerMessageId(null);
  }

  function runTouchAction(event: TouchEvent, action: () => void) {
    event.preventDefault();
    event.stopPropagation();
    action();
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-6 py-5 max-sm:px-2 max-sm:py-2">
      {hasMore ? (
        <Button
          type="button"
          variant="secondary"
          disabled={isLoadingMore}
          onClick={onLoadOlder}
          className="mx-auto mb-3 max-sm:py-1.5"
        >
          {isLoadingMore ? "Loading..." : "Load older"}
        </Button>
      ) : null}

      <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2 max-sm:pr-0">
        <div className="flex min-h-full flex-col gap-5 py-2 max-sm:gap-3 max-sm:px-1">
          {orderedMessages.map((message) => {
            const isMine = currentUser?.id === message.userId;
            const displayName = isMine ? "You" : message.username || "Unknown";
            const avatarUrl = isMine ? currentUser?.avatarUrl || message.avatarUrl : message.avatarUrl;
            const visibleReactions = message.reactions.slice(0, MAX_VISIBLE_REACTIONS);
            const hiddenReactionCount = message.reactions.length - visibleReactions.length;

            return (
              <div key={message.id} className={`group flex ${isMine ? "justify-end" : "justify-start"}`}>
                <Card
                  onTouchStart={() => startLongPress(message.id)}
                  onTouchEnd={endLongPress}
                  onTouchMove={cancelLongPress}
                  onTouchCancel={cancelLongPress}
                  className={`relative grid min-w-[min(21rem,calc(100vw-2rem))] max-w-[78%] gap-3 rounded-2xl border-[#dfe5f2] p-4 pb-6 shadow-[0_10px_30px_rgba(38,37,56,0.08)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#c9d5ee] hover:shadow-[0_16px_38px_rgba(38,37,56,0.13)] max-sm:min-w-0 max-sm:max-w-[92%] max-sm:gap-2 max-sm:rounded-xl max-sm:p-2.5 max-sm:pb-6 ${
                    isMine
                      ? "grid-cols-[minmax(0,1fr)_42px] bg-[#edf5ff] max-sm:grid-cols-[minmax(0,1fr)_32px]"
                      : "grid-cols-[42px_minmax(0,1fr)] bg-white max-sm:grid-cols-[32px_minmax(0,1fr)]"
                  }`}
                >
                  <div
                    className={`absolute -top-4 z-10 hidden max-w-[calc(100vw-1rem)] translate-y-1 items-center gap-1 overflow-x-auto rounded-full border border-[#dfe5f2] bg-white/95 px-1.5 py-1 opacity-0 shadow-lg shadow-[#262538]/10 backdrop-blur transition duration-200 ease-out md:flex md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 ${isMine ? "left-4" : "right-4"
                    }`}
                    onTouchStart={(event) => event.stopPropagation()}
                    onTouchEnd={(event) => event.stopPropagation()}
                    onTouchMove={(event) => event.stopPropagation()}
                    onTouchCancel={(event) => event.stopPropagation()}
                  >
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        title={
                          message.reactions.some((reaction) => reaction.emoji === emoji && reaction.reactedByMe)
                            ? `Remove ${emoji}`
                            : `React ${emoji}`
                        }
                        aria-label={
                          message.reactions.some((reaction) => reaction.emoji === emoji && reaction.reactedByMe)
                            ? `Remove ${emoji}`
                            : `React ${emoji}`
                        }
                        onClick={() => {
                          toggleReaction(message, emoji);
                          setActiveActionMessageId(null);
                        }}
                        onTouchEnd={(event) =>
                          runTouchAction(event, () => {
                            toggleReaction(message, emoji);
                            setActiveActionMessageId(null);
                          })
                        }
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-base transition hover:scale-110 max-sm:h-7 max-sm:w-7 max-sm:text-sm ${
                          message.reactions.some((reaction) => reaction.emoji === emoji && reaction.reactedByMe)
                            ? "bg-[#dce9ff] ring-1 ring-[#9ebcff]"
                            : "hover:bg-[#eff4ff]"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      type="button"
                      title="Add emoji"
                      aria-label="Add emoji"
                      onClick={() => {
                        setEmojiPickerMessageId(message.id);
                        setActiveActionMessageId(null);
                      }}
                      onTouchEnd={(event) =>
                        runTouchAction(event, () => {
                          setEmojiPickerMessageId(message.id);
                          setActiveActionMessageId(null);
                        })
                      }
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#3525cd] transition hover:scale-110 hover:bg-[#eff4ff] max-sm:h-7 max-sm:w-7"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {isMine ? (
                      <button
                        type="button"
                        title="Delete message"
                        aria-label="Delete message"
                        onClick={() => {
                          onDeleteMessage(message.id);
                          setActiveActionMessageId(null);
                        }}
                        onTouchEnd={(event) =>
                          runTouchAction(event, () => {
                            onDeleteMessage(message.id);
                            setActiveActionMessageId(null);
                          })
                        }
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#cc2f4a] transition hover:scale-110 hover:bg-[#fff0f3] max-sm:h-7 max-sm:w-7"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>

                  {!isMine ? <Avatar name={displayName} avatarUrl={avatarUrl} /> : null}

                  <div className={isMine ? "text-right max-sm:text-left" : ""}>
                    <div
                      className={`mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <strong className="text-sm font-bold text-[#262538]">{displayName}</strong>
                      <span className="text-xs font-medium text-[#8a90a3]">{formatTime(message.createdAt)}</span>
                    </div>

                    <p
                      className={
                        message.isDeleted
                          ? "text-sm italic leading-6 text-[#77758a]"
                          : "whitespace-pre-wrap break-words text-sm leading-6 text-[#36384a] [overflow-wrap:anywhere]"
                      }
                    >
                      {message.isDeleted ? "This message was deleted." : message.content}
                    </p>

                    {!message.isDeleted && message.images.length > 0 ? (
                      <MessageImageGallery images={message.images.map(resolveAssetUrl)} />
                    ) : null}
                  </div>

                  {isMine ? <Avatar name={displayName} avatarUrl={avatarUrl} /> : null}

                  {message.reactions.length > 0 ? (
                    <div
                      className={`absolute -bottom-3 flex max-w-[92%] items-center gap-1 ${
                        isMine ? "right-14 justify-end" : "left-14 justify-start"
                      }`}
                    >
                      {visibleReactions.map((reaction) => (
                        <button
                          key={reaction.emoji}
                          type="button"
                          title={reaction.reactedByMe ? "Remove reaction" : "Add reaction"}
                          aria-label={`${reaction.emoji} ${reaction.count}`}
                          onClick={() => toggleReaction(message, reaction.emoji)}
                          onTouchEnd={(event) => runTouchAction(event, () => toggleReaction(message, reaction.emoji))}
                          className={`flex h-7 items-center gap-1 rounded-full border px-2 text-xs font-bold shadow-sm transition hover:-translate-y-0.5 ${
                            reaction.reactedByMe
                              ? "border-[#9ebcff] bg-[#dce9ff] text-[#3525cd]"
                              : "border-[#dfe5f2] bg-white text-[#464555] hover:border-[#c9d5ee]"
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </button>
                      ))}
                      {hiddenReactionCount > 0 ? (
                        <button
                          type="button"
                          title="Show all reactions"
                          aria-label="Show all reactions"
                          onClick={() => setReactionDetailsMessageId(message.id)}
                          onTouchEnd={(event) =>
                            runTouchAction(event, () => setReactionDetailsMessageId(message.id))
                          }
                          className="flex h-7 items-center rounded-full border border-[#dfe5f2] bg-white px-2 text-xs font-bold text-[#464555] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9d5ee]"
                        >
                          ... +{hiddenReactionCount}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {activeActionMessage ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close message actions"
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setActiveActionMessageId(null)}
            onTouchEnd={(event) => runTouchAction(event, () => setActiveActionMessageId(null))}
          />

          <div
            className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dfe5f2] bg-white px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-16px_38px_rgba(38,37,56,0.16)]"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
            onTouchEnd={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex max-w-sm items-center justify-center gap-2 overflow-x-auto">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  title={
                    activeActionMessage.reactions.some((reaction) => reaction.emoji === emoji && reaction.reactedByMe)
                      ? `Remove ${emoji}`
                      : `React ${emoji}`
                  }
                  aria-label={
                    activeActionMessage.reactions.some((reaction) => reaction.emoji === emoji && reaction.reactedByMe)
                      ? `Remove ${emoji}`
                      : `React ${emoji}`
                  }
                  onClick={() => {
                    toggleReaction(activeActionMessage, emoji);
                    setActiveActionMessageId(null);
                  }}
                  onTouchEnd={(event) =>
                    runTouchAction(event, () => {
                      toggleReaction(activeActionMessage, emoji);
                      setActiveActionMessageId(null);
                    })
                  }
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg transition ${
                    activeActionMessage.reactions.some((reaction) => reaction.emoji === emoji && reaction.reactedByMe)
                      ? "bg-[#dce9ff] ring-1 ring-[#9ebcff]"
                      : "bg-[#f5f7fc]"
                  }`}
                >
                  {emoji}
                </button>
              ))}

              <button
                type="button"
                title="Add emoji"
                aria-label="Add emoji"
                onClick={() => {
                  setEmojiPickerMessageId(activeActionMessage.id);
                  setActiveActionMessageId(null);
                }}
                onTouchEnd={(event) =>
                  runTouchAction(event, () => {
                    setEmojiPickerMessageId(activeActionMessage.id);
                    setActiveActionMessageId(null);
                  })
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5f7fc] text-[#3525cd]"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>

              {currentUser?.id === activeActionMessage.userId ? (
                <button
                  type="button"
                  title="Delete message"
                  aria-label="Delete message"
                  onClick={() => {
                    onDeleteMessage(activeActionMessage.id);
                    setActiveActionMessageId(null);
                  }}
                  onTouchEnd={(event) =>
                    runTouchAction(event, () => {
                      onDeleteMessage(activeActionMessage.id);
                      setActiveActionMessageId(null);
                    })
                  }
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f3] text-[#cc2f4a]"
                >
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Dialog
        open={Boolean(reactionDetailsMessage)}
        onClose={() => setReactionDetailsMessageId(null)}
        title="Message reactions"
        description="People who reacted to this message."
      >
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
          {reactionDetailsMessage?.reactions.map((reaction) => (
            <div key={reaction.emoji} className="rounded-xl border border-[#e1e6f4] bg-[#f8faff] p-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm">
                    {reaction.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#262538]">{reaction.emoji}</p>
                    <p className="text-xs font-medium text-[#77758a]">
                      {reaction.count} {reaction.count === 1 ? "reaction" : "reactions"}
                    </p>
                  </div>
                </div>
                {reaction.reactedByMe ? (
                  <button
                    type="button"
                    title="Remove reaction"
                    aria-label="Remove reaction"
                    onClick={() => reactionDetailsMessage && toggleReaction(reactionDetailsMessage, reaction.emoji)}
                    className="grid h-9 w-9 place-items-center rounded-full text-[#cc2f4a] transition hover:bg-[#fff0f3]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-2">
                {(reaction.users || []).length > 0 ? (
                  reaction.users?.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5">
                      <Avatar name={user.username} avatarUrl={user.avatarUrl} />
                      <span className="min-w-0 truncate text-sm font-semibold text-[#464555]">
                        {user.id === currentUser?.id ? "You" : user.username || "Unknown"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg bg-white px-2 py-1.5 text-sm text-[#77758a]">
                    User details are not available for this reaction.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={Boolean(emojiPickerMessage)}
        onClose={() => setEmojiPickerMessageId(null)}
        hideHeader
      >
        <div className="overflow-hidden rounded-lg">
          <Picker
            data={data}
            onEmojiSelect={chooseEmoji}
            previewPosition="none"
            skinTonePosition="none"
            navPosition="bottom"
            perLine={7}
            maxFrequentRows={2}
          />
        </div>
      </Dialog>
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name?: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveAssetUrl(avatarUrl)}
        alt=""
        className="h-10 w-10 rounded-2xl border border-[#dfe5f2] object-cover shadow-sm max-sm:h-9 max-sm:w-9"
      />
    );
  }

  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#3525cd] text-sm font-bold text-white shadow-sm max-sm:h-9 max-sm:w-9">
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
