import type { FC } from "react";

import { api } from "../../../utils/api";

type Props = {
  noteId: string;
};

export const DeleteButton: FC<Props> = ({ noteId }) => {
  const context = api.useContext();
  const mutation = api.note.delete.useMutation({
    onSuccess() {
      context.note.invalidate();
    },
  });
  return (
    <button data-testid="delete-button" onClick={() => mutation.mutate(noteId)}>
      削除
    </button>
  );
};
