type ServerActionState = {
  type: "success" | "error";
  message: string;
} | null;

export type ServerAction<T = ServerActionState> = (
  state: T,
  formData: FormData,
) => Promise<T>;
