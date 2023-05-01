import { Avatar, Box, Button, Flex, Textarea } from "@mantine/core";
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
    <Flex>
      <Avatar
        src="https://api.dicebear.com/6.x/thumbs/svg?seed=Abby"
        size="lg"
        mr="sm"
      />
      <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1 }}>
        <Textarea
          data-testid="note-form__textarea"
          name="text"
          {...form.getInputProps("text")}
        ></Textarea>
        <Flex justify="flex-end">
          <Button
            data-testid="note-form__button"
            type="submit"
            leftIcon={<IconFeather size="1rem" />}
            loading={mutation.isLoading}
          >
            送信
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
