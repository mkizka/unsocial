import { getUser } from "@/utils/getServerSession";

import { NoteForm } from "./_shared/components/note/NoteForm";
import { Timeline } from "./_shared/components/note/Timeline";

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
