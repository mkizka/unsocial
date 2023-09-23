"use client";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { timelineAtom } from "@/components/atoms/timeline";
import { SubmitButton } from "@/components/clients/SubmitButton";
import { NoteCard } from "@/components/features/note/NoteCard";

import { action } from "./action";

type Props = {
  userId?: string;
};

export function TimelineLoader({ userId }: Props) {
  const [timeline, setTimeline] = useAtom(timelineAtom);
  const [isLoading, setIsLoading] = useState(false);

  const loadMoreNotes = async () => {
    if (!timeline) {
      const notes = await action({ userId });
      setTimeline([notes]);
    } else {
      const lastNote = timeline.at(-1)?.at(-1);
      if (!lastNote) return;
      const newNotes = await action({ userId, until: lastNote.publishedAt });
      setTimeline([...timeline, newNotes]);
    }
  };

  useEffect(() => {
    loadMoreNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
