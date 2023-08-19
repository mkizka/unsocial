import Link from "next/link";

import { Timeline } from "../Timeline";

export async function GuestHome() {
  return (
    <main>
      <Link href="/auth">ログイン</Link>
      <Timeline />
    </main>
  );
}
