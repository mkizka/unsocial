"use client";
import { useState } from "react";
import ImageViewer from "react-simple-image-viewer";

type Props = {
  url: string;
};

export function AttachmentImages({ url }: Props) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  return (
    <>
      <img
        className="mt-2 block aspect-video cursor-pointer object-cover"
        src={url}
        alt=""
        onClick={() => setIsViewerOpen(true)}
      />
      {isViewerOpen && (
        <ImageViewer
          src={[url + "?format=original"]}
          currentIndex={0}
          disableScroll
          closeOnClickOutside
          backgroundStyle={{
            backgroundColor: "rgb(0 0 0 / 0.9)",
          }}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
}
