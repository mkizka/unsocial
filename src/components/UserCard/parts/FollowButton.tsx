import type { FollowStatus } from "@prisma/client";
import type { FC } from "react";

import { api } from "../../../utils/api";

type Props = {
  userId: string;
};

const FOLLOW_TEXT = {
  SENT: "フォロー送信済み",
  ACCEPTED: "フォロー中",
  FAILED: "再フォロー", // TODO: 実装する
} as const satisfies {
  [key in FollowStatus]: string;
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
      {follow ? FOLLOW_TEXT[follow.status] : "フォロー"}
    </button>
  );
};
