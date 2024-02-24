import { defineLikeFactory } from "@/_generated";

import { LocalNoteFactory, RemoteNoteFactory } from "./note";
import { LocalUserFactory } from "./user";

export const LikeFactory = defineLikeFactory({
  defaultData: {
    user: LocalUserFactory,
    note: LocalNoteFactory,
    content: "👍",
  },
});

export const RemoteLikeFactory = defineLikeFactory({
  defaultData: {
    user: LocalUserFactory,
    note: RemoteNoteFactory,
    content: "👍",
  },
});
