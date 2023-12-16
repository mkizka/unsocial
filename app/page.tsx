import { NoteForm } from "./_shared/components/note/NoteForm";
import { Timeline } from "./_shared/components/note/Timeline";
import { getSessionUserId } from "./_shared/utils/session";

export default async function Page() {
  const userId = await getSessionUserId();
  if (userId) {
    return (
      <>
        <NoteForm />
        <Timeline />
      </>
    );
  }
  return <Timeline />;
}
