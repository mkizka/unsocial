import type { FC } from "react";

import { api } from "../../../utils/api";

type Props = {
  userId: string;
};

export const FollowButton: FC<Props> = ({ userId }) => {
  const context = api.useContext();
  const { data: follow } = api.follow.get.useQuery(userId);
  const mutation = api.follow.create.useMutation({
    onSuccess() {
      context.follow.invalidate();
    },
  });
  return (
    <button data-testid="follow-button" onClick={() => mutation.mutate(userId)}>
      {follow ? "フォロー解除" : "フォロー"}
    </button>
  );
};
