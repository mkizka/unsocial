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
      className="w-full mx-auto bg-primary-light shadow rounded px-8 pt-6 pb-4 mb-4"
    >
      <textarea
        data-testid="note-form__textarea"
        name="content"
        placeholder="ここにテキストを入力"
        className="w-full h-32 border-primary-dark outline-none resize-none rounded p-4"
      ></textarea>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
