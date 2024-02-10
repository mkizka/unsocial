import { redirect } from "next/navigation";

import { NoteForm } from "./_shared/note/components/NoteForm";
import { Timeline } from "./_shared/note/components/Timeline";
import { userSessionService } from "./_shared/user/services/userSessionService";
import { env } from "./_shared/utils/env";
import { prisma } from "./_shared/utils/prisma";

export default async function Page() {
  const userId = await userSessionService.getUserId();
  if (userId) {
    return (
      <>
        <NoteForm />
        <Timeline />
      </>
    );
  }
  const user = await prisma.user.findFirst({
    where: {
      AND: [
        // 連合用のシステムアカウントでない
        { preferredUsername: { not: env.UNSOCIAL_HOST } },
        { host: { equals: env.UNSOCIAL_HOST } },
      ],
    },
  });
  if (!user) {
    redirect("/auth");
  }
  return redirect(`/@${user.preferredUsername}`);
}
