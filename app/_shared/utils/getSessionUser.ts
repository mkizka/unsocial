import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerSession } from "./getServerSession";
import { prisma } from "./prisma";

const cachedGetSessionUserId = cache(async () => {
  const session = await getServerSession();
  return session?.user?.id ?? null;
});

const cachedGetSessionUser = cache(async () => {
  const sessionUserId = await cachedGetSessionUserId();
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

type GetSessionUserParams<T extends boolean> = {
  redirect?: T;
};

export const getSessionUserId = async <T extends boolean>(
  params: GetSessionUserParams<T>,
) => {
  const userId = await cachedGetSessionUserId();
  if (!userId && params.redirect) {
    redirect("/auth");
  }
  return userId as T extends true ? string : string | null;
};

export const getSessionUser = async <T extends boolean>(
  params: GetSessionUserParams<T>,
) => {
  const user = await cachedGetSessionUser();
  if (!user && params.redirect) {
    redirect("/auth");
  }
  return user as T extends true ? User : User | null;
};

const userId = getSessionUserId({ redirect: true });
const userId2 = getSessionUserId({ redirect: false });
const user = getSessionUserId({ redirect: true });
const user2 = getSessionUserId({ redirect: false });
