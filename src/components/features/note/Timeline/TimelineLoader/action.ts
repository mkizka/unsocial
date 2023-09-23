"use server";
import { noteService } from "@/server/service";

type Params = {
  userId?: string;
  until?: Date;
};
export const action = ({ userId, until }: Params) => {
  return noteService.findManyNoteCards({
    userId,
    until,
    count: 10,
  });
};
