import Link from "next/link";

import { getServerSession } from "@/utils/getServerSession";

import { SignOutButton } from "./SignOutButton";

export async function AuthLink() {
  const session = await getServerSession();
  if (session) {
    return (
      <div className="flex">
        <div className="mr-2 text-gray" data-testid="is-logged-in">
          {session?.user.id}でログイン中
        </div>
        <SignOutButton />
      </div>
    );
  }
  return (
    <Link href="/auth" className="block">
      ログイン
    </Link>
  );
}
