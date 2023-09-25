"use client";

import { useTimelineReloader } from "@/components/atoms/timeline";

import { action } from "./action.server";
import { SubmitButton } from "./parts/SubmitButton";

export function NoteForm() {
  const reloader = useTimelineReloader();
  return (
    <form
      action={async (formData: FormData) => {
        const note = await action(formData);
        if ("error" in note) return;
        reloader.reload();
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
