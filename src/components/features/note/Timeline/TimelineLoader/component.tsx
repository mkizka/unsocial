"use client";
import { useState } from "react";

import { SubmitButton } from "@/components/clients/SubmitButton";
import { NoteCard } from "@/components/features/note/NoteCard";
import type { noteService } from "@/server/service";

import { action } from "./action";

type Props = {
  firstLoadedNotes: noteService.NoteCard[];
  userId?: string;
};

export function TimelineLoader({ firstLoadedNotes, userId }: Props) {
  const [timeline, setTimeline] = useState<noteService.NoteCard[][]>([
    firstLoadedNotes,
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreNotes = async () => {
    const lastNote = timeline.at(-1)?.at(-1);
    if (!lastNote) {
      return;
    }
    const newNotes = await action({ userId, until: lastNote.publishedAt });
    setTimeline((prev) => [...(prev ?? []), newNotes]);
  };

  if (timeline.flat().length === 0) {
    return <div className="mt-4">ノートがありません</div>;
  }

  return (
    <ul className="w-full">
      {timeline.flat().map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
      {timeline.at(-1)?.length !== 0 && (
        <li>
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
        </li>
      )}
    </ul>
  );
}
