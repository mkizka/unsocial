import { defineFollowFactory } from "@/_generated";

import { LocalUserFactory, RemoteUserFactory } from "./user";

export const FollowFactory = defineFollowFactory({
  defaultData: {
    follower: RemoteUserFactory,
    followee: LocalUserFactory,
  },
});
