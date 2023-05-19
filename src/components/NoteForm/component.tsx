import { revalidatePath } from "next/cache";

import { action as _action } from "./action";

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
      className="w-full mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <textarea
        data-testid="note-form__textarea"
        name="content"
        className="w-full h-32 border rounded-lg p-2 mb-4"
      ></textarea>
      <button
        data-testid="note-form__button"
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        送信
      </button>
    </form>
  );
}
