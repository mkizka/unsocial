import { defineUserFactory } from "@/_generated";

export const LocalUserFactory = defineUserFactory({
  defaultData: {
    host: "myhost.example.com",
  },
});

export const RemoteUserFactory = defineUserFactory({
  defaultData: {
    host: "remote.example.com",
    actorUrl: "https://remote.example.com/u/dummy_remote",
  },
});
