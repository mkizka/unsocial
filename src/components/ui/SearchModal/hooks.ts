import { atom, useAtom } from "jotai";

const isOpenAtom = atom(false);

export const useSearchModal = () => {
  const [isOpen, setIsOpen] = useAtom(isOpenAtom);
  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};
