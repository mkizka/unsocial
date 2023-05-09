import type { FC } from "react";

import { NoteCard } from "../../../src/components/NoteCard";
import { api } from "../../utils/api";

export const Timeline: FC = () => {
  const { data: notes } = api.note.find.useQuery();
  return (
    <div>
      {notes && notes.map((note) => <NoteCard key={note.id} note={note} />)}
    </div>
  );
};
