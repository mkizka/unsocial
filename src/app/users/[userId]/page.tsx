import { notFound } from "next/navigation";

import { UserCard } from "@/components/UserCard";
import { prisma } from "@/server/prisma";
import { env } from "@/utils/env";
import { findOrFetchUserByWebfinger } from "@/utils/findOrFetchUser";

/**
 * userIdは以下のパターンを想定
 * - ${id}                ... DBからidで検索
 * - @${preferredUsername}             ... DBからpreferredUsernameで検索
 * - @${preferredUsername}@${env.HOST} ... DBからpreferredUsernameで検索
 * - @${preferredUsername}@${他サーバー} ... 他サーバーのwebFingerから取得
 */
const findOrFetchUserById = async (userId: string) => {
  if (userId.startsWith("@")) {
    const [preferredUsername, host] = userId.split("@").slice(1);
    if (!preferredUsername) {
      return null;
    }
    return findOrFetchUserByWebfinger(preferredUsername, host ?? env.HOST);
  }
  return prisma.user.findFirst({ where: { id: userId } });
};

export default async function UserPage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = decodeURIComponent(params.userId);
  const user = await findOrFetchUserById(userId);
  if (!user) {
    notFound();
  }
  // @ts-expect-error
  return <UserCard user={user} />;
}
