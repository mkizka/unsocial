import { atom, useAtom } from "jotai";

const timelineReloadCounterAtom = atom(0);

export const useTimelineReloader = () => {
  const [counter, setTimelineReloadCounter] = useAtom(
    timelineReloadCounterAtom,
  );
  const reload = () => {
    setTimelineReloadCounter((prev) => (prev ? prev + 1 : 1));
  };
  return { counter, reload };
};
