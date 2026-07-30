import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-[#e1e6f4] bg-white shadow-sm ${className}`}
      {...props}
    />
  );
}
