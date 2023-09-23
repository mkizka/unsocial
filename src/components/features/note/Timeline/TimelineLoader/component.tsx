"use client";
import { useEffect, useState } from "react";

import { SubmitButton } from "@/components/clients/SubmitButton";
import { NoteCard } from "@/components/features/note/NoteCard";
import type { noteService } from "@/server/service";

import { action } from "./action";

export function TimelineLoader() {
  const [notes, setNotes] = useState<noteService.NoteCard[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log(notes);

  const loadMoreNotes = async () => {
    if (!notes) {
      const notes = await action();
      setNotes([notes]);
    } else {
      const lastNote = notes.flat().at(-1);
      if (!lastNote) return;
      const newNotes = await action(lastNote.publishedAt);
      setNotes([...notes, newNotes]);
    }
  };

  useEffect(() => {
    loadMoreNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!notes) return <div>loading...</div>;
  if (notes.length === 0) return <div>ノートがありません</div>;

  return (
    <div>
      {notes.flat().map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
      {notes.at(-1)?.length !== 0 && (
        <SubmitButton
          loading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            await loadMoreNotes();
            setIsLoading(false);
          }}
        >
          もっと見る
        </SubmitButton>
      )}
    </div>
  );
}
