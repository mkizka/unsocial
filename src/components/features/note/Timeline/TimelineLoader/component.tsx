"use client";
import { useEffect, useState } from "react";

import { useTimelineReloader } from "@/components/atoms/timeline";
import { SubmitButton } from "@/components/clients/SubmitButton";
import { NoteCard } from "@/components/features/note/NoteCard";
import type { noteService } from "@/server/service";

import { action } from "./action";

type Props = {
  userId?: string;
};

export function TimelineLoader({ userId }: Props) {
  const reloader = useTimelineReloader();
  const [timeline, setTimeline] = useState<noteService.NoteCard[][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFisrtNotes = async () => {
    const notes = await action({ userId });
    setTimeline([notes]);
  };

  const loadMoreNotes = async () => {
    if (!timeline) {
      await loadFisrtNotes();
      return;
    }
    const lastNote = timeline.at(-1)?.at(-1);
    if (!lastNote) {
      return;
    }
    const newNotes = await action({ userId, until: lastNote.publishedAt });
    setTimeline((prev) => [...(prev ?? []), newNotes]);
  };

  useEffect(() => {
    loadFisrtNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloader.counter]);

  if (!timeline) return <div>loading...</div>;
  if (timeline.flat().length === 0) return <div>ノートがありません</div>;

  return (
    <div>
      {timeline.flat().map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
      {timeline.at(-1)?.length !== 0 && (
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
