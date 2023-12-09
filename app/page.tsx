import { NoteForm } from "./_shared/components/note/NoteForm";
import { Timeline } from "./_shared/components/note/Timeline";
import { getUser } from "./_shared/utils/getServerSession";

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
