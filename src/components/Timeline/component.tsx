"use client";
import useSWRInfinite from "swr/infinite";

import type { TimelineResponse } from "@/app/api/timeline/route";

import { NoteCard } from "../NoteCard";

const getKey = (index: number, previousPageData: TimelineResponse[]) => {
  if (previousPageData && !previousPageData.length) return null; // reached the end
  return `/api/notes?page=${index + 1}`;
};

const fetcher = (url: string) =>
  fetch(url).then(
    // TODO: 型見直す
    (res) => res.json() as unknown as Promise<TimelineResponse>,
  );

export function Timeline() {
  const { data: notes, error } = useSWRInfinite(getKey, fetcher);
  if (error) return <div>failed to load</div>;
  if (!notes) return <div>loading...</div>;

  return (
    <div>
      {notes.flat().map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
