import { redirect } from "next/navigation";

import { getServerSession } from "@/_shared/utils/getServerSession";
import { prisma } from "@/_shared/utils/prisma";

import { AuthForm } from "./_components/AuthForm";

export default async function SigninPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }
  const count = await prisma.credential.count();
  return <AuthForm action={count > 0 ? "signIn" : "signUp"} />;
}
