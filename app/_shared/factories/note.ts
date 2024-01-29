import { defineNoteFactory } from "@/_generated";

import { LocalUserFactory, RemoteUserFactory } from "./user";

export const RemoteNoteFactory = defineNoteFactory({
  defaultData: {
    user: RemoteUserFactory,
  },
});

export const LocalNoteFactory = defineNoteFactory({
  defaultData: {
    user: LocalUserFactory,
  },
});
