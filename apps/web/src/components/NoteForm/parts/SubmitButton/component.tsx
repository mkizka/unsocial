"use client";

import { experimental_useFormStatus as useFormStatus } from "react-dom";

import { Spinner } from "@/components/Spinner";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      data-testid="note-form__button"
      type="submit"
      className="bg-secondary text-light w-20 h-8 py-1 px-4 rounded"
      disabled={pending}
    >
      {pending ? <Spinner /> : "送信"}
    </button>
  );
}
