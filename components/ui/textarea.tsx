import { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`rounded-lg border border-[#c7c4d8] bg-white px-3 py-2 text-sm text-[#464555] outline-[#3525cd] ${className}`}
      {...props}
    />
  );
}
