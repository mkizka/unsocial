// Stryker disable all
import { getServerSession as _getServerSession } from "next-auth";
import { cache } from "react";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const getServerSession = cache(async () => {
  return _getServerSession(authOptions);
});

export const getUser = async () => {
  const session = await getServerSession();
  return session?.user ?? null;
};
