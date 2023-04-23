import type { FC } from "react";

import { api } from "../../../utils/api";
import { UserCard } from "../../UserCard";

type Props = {
  noteId: string;
};
export const LikeDetail: FC<Props> = ({ noteId }) => {
  const {
    data: likes,
    refetch,
    isFetched,
  } = api.like.details.useQuery(noteId, {
    enabled: false,
  });

  return (
    <details
      data-testid="like-details-opener"
      onClick={() => !isFetched && refetch()}
    >
      {likes?.map((like) => (
        <p key={like.user.id}>
          <span>{like.content}</span>
          <UserCard user={like.user} />
        </p>
      ))}
    </details>
  );
};
