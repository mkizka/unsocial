import { Button, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFeather } from "@tabler/icons-react";
import type { FC } from "react";

import { api } from "../../utils/api";

export const NoteForm: FC = () => {
  const context = api.useContext();
  const mutation = api.note.create.useMutation({
    onSuccess() {
      context.note.invalidate();
    },
  });
  const form = useForm({
    initialValues: {
      text: "",
    },
  });
  const handleSubmit = form.onSubmit(({ text }) => {
    mutation.mutate({ text });
  });
  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        data-testid="note-form__textarea"
        name="text"
        {...form.getInputProps("text")}
      ></Textarea>
      <Button
        data-testid="note-form__button"
        type="submit"
        leftIcon={<IconFeather size="1rem" />}
        loading={mutation.isLoading}
      >
        送信
      </Button>
    </form>
  );
};
