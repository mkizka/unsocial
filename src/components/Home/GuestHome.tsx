import Link from "next/link";

import { noteService } from "@/server/service";

import { Timeline } from "../Timeline";

export async function GuestHome() {
  const notes = await noteService.findManyNoteCards();
  return (
    <main>
      <Link href="/auth">ログイン</Link>
      <Timeline notes={notes} />
    </main>
  );
}
