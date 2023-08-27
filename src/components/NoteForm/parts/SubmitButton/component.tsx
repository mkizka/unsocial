"use client";

import { experimental_useFormStatus as useFormStatus } from "react-dom";

import { Spinner } from "@/components/Spinner";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      data-testid="note-form__button"
      type="submit"
      className="h-8 w-20 rounded bg-secondary px-4 py-1 text-light"
      disabled={pending}
    >
      {pending ? <Spinner /> : "送信"}
    </button>
  );
}
