import { redirect } from "next/navigation";

import { getUser } from "@/_shared/utils/getServerSession";
import { prisma } from "@/_shared/utils/prisma";

import { action } from "./action";
import { ProfileForm } from "./ProfileForm";

export async function ProfileFormContainer() {
  const loginUser = await getUser();
  if (!loginUser) {
    return redirect("/auth");
  }
  const user = await prisma.user.findFirst({
    where: {
      id: loginUser.id,
    },
  });
  return <ProfileForm user={user!} onSubmit={action} />;
}
