"use server";

import { noteCardFindService } from "@/_shared/note/services/noteCardFindService";

type Params = {
  userId?: string;
  until?: Date;
};

export const action = ({ userId, until }: Params) => {
  return noteCardFindService.findManyNoteCards({
    userId,
    until,
    count: 10,
  });
};
