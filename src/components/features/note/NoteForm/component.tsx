"use client";

import { Card } from "@/components/ui/Card";

import { action } from "./action";
import { SubmitButton } from "./parts/SubmitButton";

export function NoteForm() {
  return (
    <Card
      as="form"
      action={async (formData: FormData) => {
        await action(formData);
        location.reload();
      }}
      className="mb-1 px-8 pb-4 pt-6"
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
    </Card>
  );
}
