import type { noteService } from "@/server/service";

import { NoteCard } from "../NoteCard";

type Props = {
  notes: noteService.NoteCard[];
};

export function Timeline({ notes }: Props) {
  return (
    <div>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
