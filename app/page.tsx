import { NoteForm } from "./_shared/note/components/NoteForm";
import { Timeline } from "./_shared/note/components/Timeline";
import { userSessionService } from "./_shared/user/services/userSessionService";

export default async function Page() {
  const userId = await userSessionService.getUserId();
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
