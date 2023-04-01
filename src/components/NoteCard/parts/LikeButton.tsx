import type { FC } from "react";

import { api } from "../../../utils/api";

type Props = {
  noteId: string;
  isLiked: boolean;
};

export const LikeButton: FC<Props> = ({ noteId, isLiked }) => {
  const context = api.useContext();
  const mutation = api.like.create.useMutation({
    onSuccess() {
      context.note.invalidate();
    },
  });
  return (
    <button
      data-testid="like-button"
      onClick={(e) => {
        e.preventDefault();
        mutation.mutate({
          noteId,
          content: "👍",
        });
      }}
    >
      {isLiked ? "👍" : "-"}
    </button>
  );
};
