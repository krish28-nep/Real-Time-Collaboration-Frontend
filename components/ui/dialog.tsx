"use client";

import { ReactNode } from "react";
import { Button } from "./button";

type DialogProps = {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({ title, description, open, onClose, children }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#c7c4d8] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#e1e6f4] p-4">
          <div>
            <h2 className="text-lg font-bold text-[#262538]">{title}</h2>
            {description ? <p className="mt-1 text-sm text-[#77758a]">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" onClick={onClose} className="px-2 py-1">
            X
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
