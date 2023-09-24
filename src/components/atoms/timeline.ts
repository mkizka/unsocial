import { atom } from "jotai";

import type { NoteCard } from "@/server/service/note";

export const timelineAtom = atom<NoteCard[][] | null>(null);
