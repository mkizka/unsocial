import { defineUserFactory } from "@/_generated";
import { createKeys } from "@/_shared/utils/createKeys";

export const LocalUserFactory = defineUserFactory({
  defaultData: async () => {
    const keys = createKeys();
    return {
      host: "myhost.example.com",
      isAdmin: true,
      publicKey: keys.publicKey,
      credential: {
        create: {
          hashedPassword: "dummyHashedPassword",
          privateKey: keys.privateKey,
        },
      },
    };
  },
});

export const RemoteUserFactory = defineUserFactory({
  defaultData: async ({ seq }) => ({
    host: "remote.example.com",
    actorUrl: `https://remote.example.com/users/${seq}`,
    inboxUrl: `https://remote.example.com/users/${seq}/inbox`,
    publicKey: "dummyPublicKey",
  }),
});
