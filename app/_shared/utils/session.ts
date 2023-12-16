import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerSession } from "./getServerSession";
import { prisma } from "./prisma";

const getSessionUserIdOrNull = cache(async () => {
  const session = await getServerSession();
  return session?.user?.id ?? null;
});

const getSessionUserOrNull = cache(async () => {
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

export const getSessionUserId = async <T extends boolean>(params?: {
  redirect: T;
}) => {
  const userId = await getSessionUserIdOrNull();
  if (!userId && params?.redirect) {
    redirect("/auth");
  }
  return userId as T extends true ? string : string | null;
};

export const getSessionUser = async <T extends boolean>(params?: {
  redirect: T;
}) => {
  const user = await getSessionUserOrNull();
  if (!user && params?.redirect) {
    redirect("/auth");
  }
  return user as T extends true ? User : User | null;
};
