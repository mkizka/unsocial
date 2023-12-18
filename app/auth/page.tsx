import { redirect } from "next/navigation";

import { prisma } from "@/_shared/utils/prisma";
import { getSessionUserId } from "@/_shared/utils/session";

import { AuthForm } from "./_components/AuthForm";

export default async function SigninPage() {
  const userId = await getSessionUserId();
  if (userId) {
    redirect("/");
  }
  const count = await prisma.credential.count();
  return <AuthForm action={count > 0 ? "signIn" : "signUp"} />;
}
