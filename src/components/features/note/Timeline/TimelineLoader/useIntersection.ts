import { type RefObject, useEffect } from "react";

export const useIntersection = ({
  ref,
  onIntersect,
}: {
  ref: RefObject<HTMLElement>;
  onIntersect: () => void;
}) => {
  useEffect(() => {
    const observer = new IntersectionObserver(([refElementEntry]) => {
      if (refElementEntry?.isIntersecting) {
        onIntersect();
      }
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [ref, onIntersect]);
};
