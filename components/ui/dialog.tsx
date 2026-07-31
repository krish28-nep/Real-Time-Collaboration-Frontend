"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "./button";

type DialogProps = {
  title?: string;
  description?: string;
  hideHeader?: boolean;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({ title, description, hideHeader = false, open, onClose, children }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4 max-sm:p-3" onMouseDown={onClose}>
      <div
        className={`rounded-lg border border-[#c7c4d8] bg-white shadow-xl ${
          hideHeader ? "w-fit max-w-[calc(100vw-1.5rem)] overflow-hidden" : "w-full max-w-lg max-sm:max-h-[calc(100dvh-1.5rem)] max-sm:overflow-hidden"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {!hideHeader ? (
          <div className="flex items-start justify-between gap-4 border-b border-[#e1e6f4] p-4 max-sm:p-3">
            <div className="min-w-0">
              {title ? <h2 className="text-lg font-bold text-[#262538]">{title}</h2> : null}
              {description ? <p className="mt-1 text-sm text-[#77758a]">{description}</p> : null}
            </div>
            <Button type="button" variant="ghost" onClick={onClose} className="grid h-8 w-8 place-items-center p-0">
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        ) : null}
        <div className={hideHeader ? "p-0" : "p-4 max-sm:max-h-[calc(100dvh-7rem)] max-sm:overflow-y-auto max-sm:p-3"}>{children}</div>
      </div>
    </div>
  );
}
