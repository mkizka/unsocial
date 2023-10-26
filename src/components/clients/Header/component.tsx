import { SearchModal } from "@/components/clients/SearchModal";

export function Header() {
  return (
    <header className="fixed z-10 flex h-[54px] w-full items-center rounded-b-md bg-primary-light pl-4 shadow-md">
      <SearchModal />
    </header>
  );
}
