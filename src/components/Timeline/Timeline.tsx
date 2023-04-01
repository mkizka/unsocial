import type { FC } from "react";

import { api } from "../../utils/api";
import { NoteCard } from "../NoteCard";

export const Timeline: FC = () => {
  const { data: notes } = api.note.find.useQuery();
  return (
    <div>
      {notes && notes.map((note) => <NoteCard key={note.id} note={note} />)}
    </div>
  );
};
