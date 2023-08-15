import { postDicord } from "@/utils/postDiscord";

// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
  await postDicord("Unsocial Started");
}
