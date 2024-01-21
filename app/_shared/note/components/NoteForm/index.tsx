"use client";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";
import { Textarea } from "@/_shared/ui/Textarea";

import { action } from "./action";

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
      <div className="mt-1 flex justify-end">
        <Button data-testid="submit-button">送信</Button>
      </div>
    </Card>
  );
}
