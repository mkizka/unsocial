import { defineLikeFactory } from "@/_generated";

import { LocalNoteFactory } from "./note";
import { LocalUserFactory } from "./user";

export const LikeFactory = defineLikeFactory({
  defaultData: {
    user: LocalUserFactory,
    note: LocalNoteFactory,
  },
});
