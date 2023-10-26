import { SearchModal } from "@/components/clients/SearchModal";

export function Header() {
  return (
    <header className="fixed z-10 flex h-[54px] w-full items-center bg-primary-dark/75 pl-8">
      <SearchModal />
    </header>
  );
}
