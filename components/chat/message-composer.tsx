"use client";

import { ImagePlus } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageComposerProps = {
  isSending: boolean;
  onSend: (content: string, images: File[]) => void;
};

export function MessageComposer({ isSending, onSend }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent && images.length === 0) {
      return;
    }

    onSend(trimmedContent, images);
    setContent("");
    setImages([]);
  }

  function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setImages(files.slice(0, 4));
    event.target.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#e1e6f4] bg-white px-6 py-4">
      {images.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((image, index) => (
            <button
              key={`${image.name}-${index}`}
              type="button"
              onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
              className="rounded-lg border border-[#c7c4d8] bg-[#eff4ff] px-3 py-2 text-left text-xs font-semibold text-[#464555]"
            >
              {image.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <label
          title="Attach image"
          aria-label="Attach image"
          className="grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-lg bg-[#dce9ff] px-3 py-2 text-[#3525cd] hover:bg-[#cfe0ff]"
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
          rows={2}
          placeholder="Write a message"
          className="min-h-11 flex-1 resize-none"
        />
        <Button disabled={isSending} className="min-h-11 px-5">
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </form>
  );
}
