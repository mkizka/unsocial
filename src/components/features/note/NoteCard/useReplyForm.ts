import { atom, useAtom } from "jotai";

const isOpenAtom = atom(false);

export const useReplyForm = () => {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  return {
    isOpen,
    toggle: () => setIsOpen((prev) => !prev),
  };
};
