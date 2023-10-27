import Link from "next/link";

import { SearchModal } from "@/components/clients/SearchModal";
import { getServerSession } from "@/utils/getServerSession";

import { SignOutButton } from "./SignOutButton";

export async function Header() {
  const session = await getServerSession();
  return (
    <header className="fixed z-10 flex h-[54px] w-full items-center justify-between rounded-b-md bg-primary-light px-4 shadow-md">
      <SearchModal />
      {session ? (
        <div className="flex">
          <div className="mr-2 text-gray" data-testid="is-logged-in">
            {session?.user.id}でログイン中
          </div>
          <SignOutButton />
        </div>
      ) : (
        <Link href="/auth" className="block">
          ログイン
        </Link>
      )}
    </header>
  );
}
