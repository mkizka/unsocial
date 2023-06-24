import { redirect } from "next/navigation";

import { AuthForm } from "@/components/AuthForm";
import { getServerSession } from "@/utils/getServerSession";
import { prisma } from "@/utils/prisma";

export default async function SigninPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }
  const count = await prisma.credentials.count();
  return <AuthForm type={count > 0 ? "signIn" : "signUp"} />;
}
