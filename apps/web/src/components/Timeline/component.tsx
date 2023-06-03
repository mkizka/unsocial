import type { Props as NoteCardProps } from "../NoteCard";
import { NoteCard } from "../NoteCard";

type Props = {
  notes: NoteCardProps["note"][];
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
