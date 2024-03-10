import { redirect } from "next/navigation";

import { userSessionService } from "@/_shared/user/services/userSessionService";
import { prisma } from "@/_shared/utils/prisma";

import { AuthForm } from "./_components/AuthForm";

// 個人ユーザーの利用を想定しているため、管理者アカウントが1つ以上存在する場合は常にログイン画面を表示する
const getFormType = async () => {
  const count = await prisma.user.count({ where: { isAdmin: true } });
  return count > 0 ? "signIn" : "signUp";
};

export default async function SigninPage() {
  // 開発環境などでCookieが無効になることがあるため、
  // セッションからユーザーIDが取れることだけでなくDBにユーザーが存在することも確認する
  const user = await userSessionService.getUser();
  if (user) {
    return redirect("/");
  }
  return <AuthForm action={await getFormType()} />;
}
