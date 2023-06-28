import Link from "next/link";

import { repository } from "@/server/repository";

import { Timeline } from "../Timeline";

export async function GuestHome() {
  const notes = await repository.note.findTimeline();
  return (
    <main>
      <Link href="/auth">ログイン</Link>
      <Timeline notes={notes} />
    </main>
  );
}
