type FormActionState = {
  type: "success" | "error";
  message: string;
} | null;

export type FormAction<T = FormActionState> = (
  state: T,
  formData: FormData,
) => Promise<T>;
