import Link from "next/link";

import { Timeline } from "@/components/features/note/Timeline";

export async function GuestHome() {
  return (
    <main>
      <Link href="/auth">ログイン</Link>
      <Timeline />
    </main>
  );
}
