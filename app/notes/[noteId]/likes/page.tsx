import { notFound } from "next/navigation";

import { NoteCardContainer } from "@/_shared/note/components/NoteCard";
import { noteCardFindService } from "@/_shared/note/services/noteCardFindService";
import { Card } from "@/_shared/ui/Card";
import { UserList } from "@/_shared/user/components/UserList";

type Params = {
  noteId: string;
};

export default async function Page({ params }: { params: Params }) {
  const note = await noteCardFindService.findUniqueNoteCard(params.noteId);
  if (!note) {
    notFound();
  }
  return (
    <div className="space-y-1">
      <NoteCardContainer note={note} />
      <div className="flex">
        <Card className="flex-1">
          <h2 className="font-bold">いいねしたユーザー</h2>
        </Card>
      </div>
      {note.likes.length === 0 && (
        <p className="p-4 text-center">いいねしたユーザーはいません</p>
      )}
      <UserList users={note.likes.map((like) => like.user)} />
    </div>
  );
}
