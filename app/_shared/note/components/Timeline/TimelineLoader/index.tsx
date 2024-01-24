"use client";
import { useRef, useState } from "react";

import { NoteCardContainer } from "@/_shared/note/components/NoteCard";
import type { noteCardFindService } from "@/_shared/note/services/noteCardFindService";
import { Spinner } from "@/_shared/ui/Spinner";

import { action } from "./action";
import { useIntersection } from "./useIntersection";

type Props = {
  firstLoadedNotes: noteCardFindService.NoteCard[];
  userId?: string;
};

export function TimelineLoader({ firstLoadedNotes, userId }: Props) {
  const [timeline, setTimeline] = useState<noteCardFindService.NoteCard[][]>([
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
          <NoteCardContainer note={note} />
        </li>
      ))}
      {timeline.at(-1)?.length !== 0 && (
        <div
          ref={timelineLoaderRef}
          className="flex h-32 w-full justify-center pb-20 pt-4"
        >
          <Spinner className="size-8" />
        </div>
      )}
    </ul>
  );
}
