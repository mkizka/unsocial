"use server";
import { noteService } from "@/_shared/service";

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