"use client";

import { ImagePlus, Send, X } from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageComposerProps = {
  isSending: boolean;
  onSend: (content: string, images: File[]) => void;
};

export function MessageComposer({ isSending, onSend }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const imagePreviews = useMemo(
    () => images.map((image) => ({ file: image, url: URL.createObjectURL(image) })),
    [images]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage();
  }

  function sendMessage() {
    if (isSending) {
      return;
    }

    const trimmedContent = content.trim();

    if (!trimmedContent && images.length === 0) {
      return;
    }

    onSend(trimmedContent, images);
    setContent("");
    setImages([]);
  }

  function handleMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    sendMessage();
  }

  function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setImages(files.slice(0, 4));
    event.target.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 shrink-0 border-t border-[#e1e6f4] bg-white px-6 py-4 max-sm:px-3 max-sm:py-3"
    >
      {imagePreviews.length > 0 ? (
        <div className="mb-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto">
          {imagePreviews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-[#c7c4d8] bg-[#eff4ff]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                title={`Remove ${preview.file.name}`}
                aria-label={`Remove ${preview.file.name}`}
                onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/65 text-white"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex w-full min-w-0 items-end gap-2">
        <label
          title="Attach image"
          aria-label="Attach image"
          className="grid min-h-11 min-w-11 shrink-0 cursor-pointer place-items-center rounded-lg bg-[#dce9ff] px-3 py-2 text-[#3525cd] hover:bg-[#cfe0ff] max-sm:min-h-10 max-sm:min-w-10 max-sm:px-2"
        >
          <ImagePlus className="h-5 w-5" aria-hidden="true" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={selectImages}
            className="sr-only"
          />
        </label>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleMessageKeyDown}
          rows={2}
          placeholder="Write a message"
          className="min-h-11 w-full min-w-0 flex-1 resize-none max-sm:h-10 max-sm:min-h-10 max-sm:leading-5"
        />
        <Button disabled={isSending} className="min-h-11 shrink-0 px-5 max-sm:hidden">
          {isSending ? "Sending..." : "Send"}
        </Button>
        <button
          type="submit"
          disabled={isSending}
          title="Send message"
          aria-label="Send message"
          className="hidden min-h-10 min-w-10 shrink-0 place-items-center rounded-lg bg-[#3525cd] text-white transition hover:bg-[#2d1fb2] disabled:cursor-not-allowed disabled:opacity-50 max-sm:grid"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
