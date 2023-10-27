import { AuthLink } from "@/components/features/auth/AuthLink";
import { SearchModal } from "@/components/ui/SearchModal";

export function Header() {
  return (
    <header className="fixed z-10 flex h-[54px] w-full items-center justify-between rounded-b-md bg-primary-light px-4 shadow-md">
      <SearchModal />
      <AuthLink />
    </header>
  );
}
