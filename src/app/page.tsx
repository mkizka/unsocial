import { NoteForm } from "@/components/features/note/NoteForm";
import { Timeline } from "@/components/features/note/Timeline";
import { getUser } from "@/utils/getServerSession";

export default async function Page() {
  const user = await getUser();
  if (user) {
    return (
      <>
        <NoteForm />
        <Timeline />
      </>
    );
  }
  return <Timeline />;
}
