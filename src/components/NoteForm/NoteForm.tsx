import type { FC, FormEventHandler } from "react";
import { useRef } from "react";

import { api } from "../../utils/api";

export const NoteForm: FC = () => {
  const context = api.useContext();
  const mutation = api.note.create.useMutation({
    onSuccess() {
      context.note.invalidate();
    },
  });
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (ref.current) {
      mutation.mutate({ text: ref.current.value });
      ref.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        data-testid="note-form__textarea"
        name="content"
        ref={ref}
      ></textarea>
      <button data-testid="note-form__button" type="submit">
        {mutation.isLoading ? "送信中..." : "送信"}
      </button>
    </form>
  );
};
