import { defineNoteFactory } from "@/_generated";

import { LocalUserFactory, RemoteUserFactory } from "./user";

export const RemoteNoteFactory = defineNoteFactory({
  defaultData: async ({ seq }) => ({
    user: RemoteUserFactory,
    url: `https://remote.example.com/notes/${seq}`,
  }),
});

export const LocalNoteFactory = defineNoteFactory({
  defaultData: {
    user: LocalUserFactory,
  },
});

export const NoteWithQUoteFactory = defineNoteFactory({
  defaultData: {
    user: LocalUserFactory,
    quote: LocalNoteFactory,
  },
});
