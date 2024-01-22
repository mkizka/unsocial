"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { useSearchModal } from "./hooks";

export function SearchModal() {
  const searchModal = useSearchModal();
  const router = useRouter();
  return (
    <>
      <button onClick={searchModal.open} data-testid="search-modal__button">
        <MagnifyingGlassIcon className="size-7 text-dark hover:opacity-70" />
      </button>
      {searchModal.isOpen && (
        <div
          className="fixed left-0 top-0 z-50 flex cursor-pointer justify-center bg-black/70 pt-20"
          onClick={(e) => {
            // 背景をクリックしたときだけモーダルを閉じる
            if (e.target !== e.currentTarget) return;
            searchModal.close();
          }}
        >
          <div className="h-16 w-4/5 max-w-[500px] rounded-md bg-primary shadow-2xl">
            <form
              action={(formData) => {
                const input = formData.get("input");
                if (typeof input === "string" && input.startsWith("@")) {
                  searchModal.close();
                  router.push(`/${input}`);
                  return;
                }
                alert("@から始まる必要があります");
              }}
              className="flex size-full items-center justify-between px-4"
            >
              <input
                type="text"
                name="input"
                className="size-full bg-transparent text-dark focus:outline-none"
                placeholder="@name@example.com"
                autoFocus
                data-testid="search-modal__input"
              />
              <button
                type="submit"
                className="size-7 text-dark"
                data-testid="search-modal__submit"
              >
                <MagnifyingGlassIcon className="size-7 text-dark hover:opacity-70" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
