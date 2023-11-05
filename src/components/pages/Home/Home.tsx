import { NoteForm } from "@/components/features/note/NoteForm";
import { Timeline } from "@/components/features/note/Timeline";
import { Card } from "@/components/ui/Card";
import { getServerSession } from "@/utils/getServerSession";

export async function Home() {
  const session = await getServerSession();

  if (session?.user) {
    return (
      <>
        <Card>
          <NoteForm />
        </Card>
        <Timeline />
      </>
    );
  }
  return <Timeline />;
}
