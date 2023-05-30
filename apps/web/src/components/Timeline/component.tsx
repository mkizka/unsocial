import type { Props as NoteCardProps } from "../NoteCard";
import { NoteCard } from "../NoteCard";

type Props = {
  notes: NoteCardProps["note"][];
};

export function Timeline({ notes }: Props) {
  return (
    <div>
      {notes.map((note) => (
        // @ts-expect-error
        <NoteCard
          // 型検証のための改行
          key={note.id}
          note={note}
        />
      ))}
    </div>
  );
}
