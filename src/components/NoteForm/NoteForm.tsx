import { action } from "./action";

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
