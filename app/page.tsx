import { NoteForm } from "./_shared/components/note/NoteForm";
import { Timeline } from "./_shared/components/note/Timeline";
import { getSessionUserIdOrNull } from "./_shared/utils/getSessionUser";

export default async function Page() {
  const userId = await getSessionUserIdOrNull();
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
