import { defineRelayServerFactory } from "@/_generated";

export const RelayServerFactory = defineRelayServerFactory({
  defaultData: async ({ seq }) => ({
    inboxUrl: `https://relay${seq}.example.com/inbox`,
  }),
});
