"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { useSearchModal } from "./hooks";

export function SearchModal() {
  const searchModal = useSearchModal();
  return (
    <>
      <button onClick={searchModal.open}>
        <MagnifyingGlassIcon className="h-7 w-7 text-dark hover:opacity-70" />
      </button>
      {searchModal.isOpen && (
        <div
          className="fixed left-0 top-0 z-50 h-screen w-screen cursor-pointer bg-black bg-opacity-70"
          onClick={searchModal.close}
        />
      )}
    </>
  );
}
