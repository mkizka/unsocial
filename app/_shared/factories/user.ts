import { defineUserFactory } from "@/_generated";

export const LocalUserFactory = defineUserFactory({
  defaultData: {
    host: "myhost.example.com",
  },
});

export const RemoteUserFactory = defineUserFactory({
  defaultData: async ({ seq }) => ({
    host: "remote.example.com",
    actorUrl: `https://remote.example.com/users/${seq}`,
    inboxUrl: `https://remote.example.com/users/${seq}/inbox`,
  }),
});
