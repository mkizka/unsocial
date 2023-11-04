"use client";

import { action } from "./action";
import { SubmitButton } from "./parts/SubmitButton";

type Props = {
  replyToId?: string;
};

export function NoteForm({ replyToId }: Props) {
  return (
    <form
      action={async (formData: FormData) => {
        await action(formData);
        location.reload();
      }}
      className="mb-1 px-8 pb-4 pt-6"
    >
      <input type="hidden" name="replyToId" value={replyToId} />
      <textarea
        data-testid="note-form__textarea"
        name="content"
        placeholder="ここにテキストを入力"
        className="h-32 w-full resize-none rounded border-primary-dark p-4 outline-none"
      ></textarea>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
