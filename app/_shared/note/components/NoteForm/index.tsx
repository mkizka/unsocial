"use client";

import { Textarea } from "@/_shared/shadcn/ui/textarea";
import { Card } from "@/_shared/ui/Card";

import { action } from "./action";
import { SubmitButton } from "./parts/SubmitButton";

type Props = {
  replyToId?: string;
  autoFocus?: boolean;
};

export function NoteForm({ replyToId, autoFocus }: Props) {
  return (
    <Card
      as="form"
      action={async (formData: FormData) => {
        await action(formData);
        location.reload();
      }}
      className="mb-1 px-8 pb-4 pt-6"
    >
      {replyToId && <input type="hidden" name="replyToId" value={replyToId} />}
      <Textarea
        data-testid="note-form__textarea"
        name="content"
        placeholder="ここにテキストを入力"
        className="resize-none"
        autoFocus={autoFocus}
      ></Textarea>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </Card>
  );
}
