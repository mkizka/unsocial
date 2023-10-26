"use client";

import { useSearchModal } from "./hooks";

export function SearchModal() {
  const searchModal = useSearchModal();
  return (
    <>
      <button onClick={searchModal.open}>開く</button>
      {searchModal.isOpen && (
        <div
          className="fixed left-0 top-0 z-10 h-screen w-screen cursor-pointer bg-black bg-opacity-70"
          onClick={searchModal.close}
        />
      )}
    </>
  );
}
