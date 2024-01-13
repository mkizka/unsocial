import { NoteForm } from "./_shared/note/components/NoteForm";
import { Timeline } from "./_shared/note/components/Timeline";
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
