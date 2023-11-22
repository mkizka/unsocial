"use client";
import { useRef, useState } from "react";

import { NoteCard } from "@/components/features/note/NoteCard";
import { Spinner } from "@/components/ui/Spinner";
import type { noteService } from "@/server/service";

import { action } from "./action";
import { useIntersection } from "./useIntersection";

type Props = {
  firstLoadedNotes: noteService.NoteCard[];
  userId?: string;
};

export function TimelineLoader({ firstLoadedNotes, userId }: Props) {
  const [timeline, setTimeline] = useState<noteService.NoteCard[][]>([
    firstLoadedNotes,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const timelineLoaderRef = useRef<HTMLDivElement>(null);

  useIntersection({
    ref: timelineLoaderRef,
    onIntersect: async () => {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      await loadMoreNotes();
      setIsLoading(false);
    },
  });

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
    <ul className="w-full space-y-1">
      {timeline.flat().map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
      {timeline.at(-1)?.length !== 0 && (
        <div ref={timelineLoaderRef} className="h-32 w-full pb-20 pt-4">
          <Spinner />
        </div>
      )}
    </ul>
  );
}
