import { action as _action } from "./action";

// "use server"を書いたファイルをテストすると
// Cannot find module 'private-next-rsc-action-client-wrapper' というエラーが出るため、
// ここで再定義する
export async function action(formData: FormData) {
  "use server";
  await _action(formData);
}

export function NoteForm() {
  return (
    <form action={action}>
      <textarea data-testid="note-form__textarea" name="content"></textarea>
      <button data-testid="note-form__button" type="submit">
        送信
      </button>
    </form>
  );
}
