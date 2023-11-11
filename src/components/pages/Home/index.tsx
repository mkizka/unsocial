import { NoteForm } from "@/components/features/note/NoteForm";
import { Timeline } from "@/components/features/note/Timeline";
import { getServerSession } from "@/utils/getServerSession";

export async function Home() {
  const session = await getServerSession();

  if (session?.user) {
    return (
      <>
        <NoteForm />
        <Timeline />
      </>
    );
  }
  return <Timeline />;
}
