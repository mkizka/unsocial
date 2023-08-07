import { revalidatePath } from "next/cache";

import { action as _action } from "./action";
import { SubmitButton } from "./parts/SubmitButton";

// "use server"を書いたファイルをテストすると
// Cannot find module 'private-next-rsc-action-client-wrapper' というエラーが出るため、
// ここで再定義する
export async function action(formData: FormData) {
  "use server";
  await _action(formData);
  revalidatePath("/");
}

export function NoteForm() {
  return (
    <form
      action={action}
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
