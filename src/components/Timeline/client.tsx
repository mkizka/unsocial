"use client";
import useSWRInfinite, { unstable_serialize } from "swr/infinite";

import type { TimelineResponse } from "@/app/api/timeline/route";

import { SubmitButton } from "../form/SubmitButton";
import { NoteCard } from "../NoteCard";

const getKey = (_: number, previousPageData: TimelineResponse | null) => {
  if (previousPageData) {
    if (previousPageData.length === 0) return null;
    const lastNote = previousPageData.flat().at(-1);
    return `/api/timeline?until=${lastNote?.published}`;
  }
  return `/api/timeline`;
};

const fetcher = (url: string) =>
  fetch(url).then(
    // TODO: 型見直す
    (res) => res.json() as unknown as Promise<TimelineResponse>,
  );

type Props = {
  firstLoadedNotes: TimelineResponse;
};

export function ClientComponent({ firstLoadedNotes }: Props) {
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
      {notes.at(-1)?.length != 0 && (
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
