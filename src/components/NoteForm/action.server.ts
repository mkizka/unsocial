import { action as original } from "./action";

export async function action(formData: FormData) {
  "use server";
  await original(formData);
}
