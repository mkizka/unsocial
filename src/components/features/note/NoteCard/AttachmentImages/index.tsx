"use client";
import { useCallback, useMemo, useState } from "react";
import ImageViewer from "react-simple-image-viewer";

import { SwiperWrapper } from "./SwiperWrapper";

type Props = {
  urls: string[];
};

export function AttachmentImages({ urls }: Props) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const memorizedUrls = useMemo(
    () => urls.map((url) => url + "?format=original"),
    [urls],
  );

  const openImageViewer = useCallback((i: number) => {
    setIndex(i);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = useCallback(() => {
    setIndex(0);
    setIsViewerOpen(false);
  }, []);

  if (urls.length === 0) {
    return null;
  }

  return (
    <>
      <SwiperWrapper
        slides={urls.map((url, i) => (
          <img
            key={url}
            className="block aspect-square cursor-pointer rounded bg-primary-dark object-cover"
            width="200"
            height="200"
            src={url}
            alt=""
            loading="lazy"
            onClick={() => openImageViewer(i)}
          />
        ))}
      />
      {isViewerOpen && (
        <ImageViewer
          src={memorizedUrls}
          currentIndex={index}
          disableScroll
          closeOnClickOutside
          backgroundStyle={{
            zIndex: 100,
            backgroundColor: "rgb(0 0 0 / 0.9)",
            marginTop: "0px", // 親のspace-y-2を打ち消す
          }}
          onClose={closeImageViewer}
        />
      )}
    </>
  );
}
