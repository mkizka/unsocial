import { redirect } from "next/navigation";

import { getUser } from "@/app/_shared/utils/getServerSession";
import { prisma } from "@/app/_shared/utils/prisma";

import { IconFileInput } from "./IconFileInput";

export async function IconSettingsForm() {
  const loginUser = await getUser();
  if (!loginUser) {
    return redirect("/auth");
  }
  const user = await prisma.user.findFirst({
    where: {
      id: loginUser.id,
    },
  });
  return <IconFileInput iconHash={user?.iconHash ?? null} />;
}
