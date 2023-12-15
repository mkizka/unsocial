import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerSession } from "./getServerSession";
import { prisma } from "./prisma";

export const getSessionUserIdOrNull = cache(async () => {
  const session = await getServerSession();
  return session?.user?.id ?? null;
});

export const getSessionUserOrNull = cache(async () => {
  const sessionUserId = await getSessionUserIdOrNull();
  if (!sessionUserId) {
    return null;
  }
  const sessionUser = await prisma.user.findUnique({
    where: {
      id: sessionUserId,
    },
  });
  return sessionUser ?? null;
});

export const getSessionUserId = async () => {
  const userId = await getSessionUserIdOrNull();
  if (!userId) {
    redirect("/auth");
  }
  return userId;
};

export const getSessionUser = async () => {
  const user = await getSessionUserOrNull();
  if (!user) {
    redirect("/auth");
  }
  return user;
};
