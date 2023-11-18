// https://github.com/nolimits4web/swiper/issues/6466#issuecomment-1664712234
declare namespace JSX {
  interface IntrinsicElements {
    "swiper-container": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      [key: string]: unknown;
    };
    "swiper-slide": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      [key: string]: unknown;
    };
  }
}
