"use server";
import { noteService } from "@/server/service";

export const action = (until?: Date) => {
  return noteService.findManyNoteCards({
    until,
    count: 10,
  });
};
