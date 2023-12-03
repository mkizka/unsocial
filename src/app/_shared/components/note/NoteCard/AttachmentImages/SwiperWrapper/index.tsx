"use client";
import { type ReactNode, useEffect, useState } from "react";
import { register } from "swiper/element/bundle";

type Props = {
  slides: ReactNode[];
};

export function SwiperWrapper({ slides }: Props) {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    register();
    setRegistered(true);
  }, []);

  if (!registered) {
    return <div className="flex gap-2 overflow-hidden">{slides}</div>;
  }

  return (
    <swiper-container
      slides-per-view="auto"
      space-between="8" // gap-2相当
      style={{
        // https://swiperjs.com/swiper-api#pagination-css-custom-properties
        // @ts-ignore
        "--swiper-pagination-color": "#374151",
      }}
    >
      {slides.map((slide, i) => (
        <swiper-slide
          key={i}
          style={{
            // https://stackoverflow.com/questions/70821850/swiper-slidesperview-auto-wont-work-for-me
            width: "auto",
          }}
        >
          {slide}
        </swiper-slide>
      ))}
    </swiper-container>
  );
}
