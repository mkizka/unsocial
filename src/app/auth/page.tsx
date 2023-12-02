import { redirect } from "next/navigation";

import { getServerSession } from "@/utils/getServerSession";
import { prisma } from "@/utils/prisma";

import { AuthForm } from "./_components/AuthForm";

export default async function SigninPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }
  const count = await prisma.credential.count();
  return <AuthForm action={count > 0 ? "signIn" : "signUp"} />;
}
