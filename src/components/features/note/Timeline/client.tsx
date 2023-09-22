"use client";
import superjson from "superjson";
import useSWRInfinite, { unstable_serialize } from "swr/infinite";

import type { TimelineResponse } from "@/app/api/timeline/route";
import { SubmitButton } from "@/components/clients/SubmitButton";
import { NoteCard } from "@/components/features/note/NoteCard";

const createGetKey =
  (userId?: string) =>
  (_: number, previousPageData: TimelineResponse | null) => {
    const params = new URLSearchParams();
    if (previousPageData) {
      if (previousPageData.length === 0) return null;
      const lastNote = previousPageData.flat().at(-1);
      if (!lastNote?.publishedAt) return null;
      params.set("until", lastNote.publishedAt.toISOString());
    }
    if (userId) params.set("userId", userId);
    return `/api/timeline?${params.toString()}`;
  };

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    const body = await res.text();
    return superjson.parse<TimelineResponse>(body);
  });

type Props = {
  firstLoadedNotes: TimelineResponse;
  userId?: string;
};

export function ClientComponent({ firstLoadedNotes, userId }: Props) {
  const getKey = createGetKey(userId);
  const {
    data: notes,
    isValidating,
    error,
    setSize,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateFirstPage: false,
    fallback: {
      [unstable_serialize(getKey)]: [firstLoadedNotes],
    },
  });

  if (error) return <div>failed to load</div>;
  if (!notes) return <div>loading...</div>;

  return (
    <div>
      {notes.flat().map((note, i) => (
        <NoteCard key={note.id} note={note} />
      ))}
      {notes.at(-1)?.length !== 0 && (
        <SubmitButton
          loading={isValidating}
          onClick={() => setSize((size) => size + 1)}
        >
          もっと見る
        </SubmitButton>
      )}
    </div>
  );
}
