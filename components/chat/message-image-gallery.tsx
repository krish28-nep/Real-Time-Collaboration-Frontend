"use client";

import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type MessageImageGalleryProps = {
  images: string[];
};

export function MessageImageGallery({ images }: MessageImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasMultipleImages = images.length > 1;
  const activeImage = images[activeIndex];

  const adjacentImages = useMemo(() => {
    if (!isOpen || images.length < 2) {
      return [];
    }

    return [images[wrapIndex(activeIndex - 1, images.length)], images[wrapIndex(activeIndex + 1, images.length)]];
  }, [activeIndex, images, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeGallery();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event);
        return;
      }

      if (event.key === "ArrowRight") {
        showNext();
        return;
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIndex]);

  useEffect(() => {
    adjacentImages.forEach((image) => {
      const preloadImage = new window.Image();
      preloadImage.decoding = "async";
      preloadImage.src = image;
    });
  }, [adjacentImages]);

  function openGallery(index: number) {
    setActiveIndex(index);
    setDirection(0);
    setIsOpen(true);
  }

  function closeGallery() {
    setIsOpen(false);
  }

  function showImage(nextIndex: number) {
    if (nextIndex === activeIndex) {
      return;
    }

    setDirection(nextIndex > activeIndex ? 1 : -1);
    setActiveIndex(nextIndex);
  }

  function showPrevious() {
    setDirection(-1);
    setActiveIndex((current) => wrapIndex(current - 1, images.length));
  }

  function showNext() {
    setDirection(1);
    setActiveIndex((current) => wrapIndex(current + 1, images.length));
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;

    if (swipePower < -7000 || info.offset.x < -90) {
      showNext();
      return;
    }

    if (swipePower > 7000 || info.offset.x > 90) {
      showPrevious();
    }
  }

  function downloadImage() {
    if (!activeImage) {
      return;
    }

    const link = document.createElement("a");
    link.href = activeImage;
    link.download = getImageFileName(activeImage, activeIndex);
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function trapFocus(event: KeyboardEvent) {
    const focusableElements = galleryRef.current?.querySelectorAll<HTMLElement>(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`mt-3 grid gap-2 ${images.length > 1 ? "grid-cols-2" : ""}`}>
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => openGallery(index)}
            className="group block overflow-hidden rounded-xl border border-[#c7c4d8] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#9ebcff] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#9ebcff]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`Message attachment ${index + 1}`}
              loading="lazy"
              decoding="async"
              className="max-h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            ref={galleryRef}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery"
            className="fixed inset-0 z-50 grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-[#070812]/95 text-white backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseDown={closeGallery}
          >
            <div
              className="flex min-w-0 items-center justify-between gap-3 px-5 py-4 max-sm:px-3 max-sm:py-3"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/15">
                {activeIndex + 1}/{images.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadImage}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/15 transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-white/50 max-sm:h-9 max-sm:w-9"
                  title="Download image"
                  aria-label="Download image"
                >
                  <Download className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeGallery}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/15 transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-white/50 max-sm:h-9 max-sm:w-9"
                  title="Close gallery"
                  aria-label="Close gallery"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 min-w-0 overflow-hidden" onMouseDown={(event) => event.stopPropagation()}>
              {hasMultipleImages ? (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    className="absolute left-5 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white shadow-xl shadow-black/25 ring-1 ring-white/15 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 max-sm:left-3 max-sm:hidden"
                    title="Previous image"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-7 w-7" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    className="absolute right-5 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white shadow-xl shadow-black/25 ring-1 ring-white/15 transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 max-sm:right-3 max-sm:hidden"
                    title="Next image"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-7 w-7" aria-hidden="true" />
                  </button>
                </>
              ) : null}

              <div className="grid h-full place-items-center px-20 py-3 max-sm:px-3">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={`Message attachment ${activeIndex + 1} of ${images.length}`}
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag={hasMultipleImages ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={handleDragEnd}
                    decoding="async"
                    className="max-h-full max-w-full select-none rounded-xl object-contain shadow-[0_30px_100px_rgba(0,0,0,0.42)] ring-1 ring-white/10"
                  />
                </AnimatePresence>
              </div>
            </div>

            <div
              className="min-w-0 border-t border-white/10 bg-black/20 px-5 py-3 max-sm:px-3"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.35)_transparent]">
                {images.map((image, index) => (
                  <button
                    key={`${image}-thumb-${index}`}
                    ref={(element) => {
                      thumbnailRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => showImage(index)}
                    className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-white/60 max-sm:h-12 max-sm:w-16 ${
                      index === activeIndex
                        ? "border-white shadow-lg shadow-white/15"
                        : "border-white/15 opacity-65 hover:border-white/45 hover:opacity-100"
                    }`}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

const imageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 0.985,
    x: direction > 0 ? 72 : direction < 0 ? -72 : 0,
  }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.985,
    x: direction > 0 ? -72 : direction < 0 ? 72 : 0,
  }),
};

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

function getImageFileName(url: string, index: number) {
  const cleanUrl = url.split("?")[0];
  const fileName = cleanUrl.split("/").filter(Boolean).pop();
  return fileName || `message-image-${index + 1}`;
}
