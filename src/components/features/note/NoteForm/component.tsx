"use client";

import { action } from "./action.server";
import { SubmitButton } from "./parts/SubmitButton";

export function NoteForm() {
  return (
    <form
      action={async (formData: FormData) => {
        await action(formData);
        location.reload();
      }}
      className="mx-auto mb-4 w-full rounded bg-primary-light px-8 pb-4 pt-6 shadow"
    >
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
