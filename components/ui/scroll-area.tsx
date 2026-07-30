import { forwardRef, HTMLAttributes } from "react";

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "vertical" | "horizontal" | "both";
};

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { className = "", orientation = "vertical", ...props },
  ref
) {
  const overflowClass = {
    vertical: "overflow-y-auto overflow-x-hidden",
    horizontal: "overflow-x-auto overflow-y-hidden",
    both: "overflow-auto",
  }[orientation];
  const gutterClass = orientation === "vertical" ? "[scrollbar-gutter:stable]" : "";

  return (
    <div
      ref={ref}
      className={`scrollarea min-h-0 overscroll-contain ${gutterClass} ${overflowClass} ${className}`}
      {...props}
    />
  );
});
