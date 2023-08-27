import { notFound } from "next/navigation";

import { UserCard } from "@/components/features/user/UserCard";
import { Timeline } from "@/components/Timeline";
import { UserTab } from "@/components/UserTab";
import { noteService, userService } from "@/server/service";

type Props = {
  userId: string;
  currentTab: string;
};

export async function UserPage({ userId, currentTab }: Props) {
  const user = await userService.findOrFetchUserByParams({ userId });
  if (!user) {
    notFound();
  }
  const notes = await noteService.findManyNoteCardsByUserId(user.id);
  const rootPath = `/${decodeURIComponent(userId)}`;
  return (
    <>
      <UserCard user={user} />
      <UserTab
        current={currentTab}
        tabs={{
          root: {
            name: "投稿",
            href: rootPath,
            render: () => <Timeline />,
          },
          likes: {
            name: "いいね",
            href: `${rootPath}/likes`,
            render: () => <Timeline />,
          },
          following: {
            name: "フォロー",
            href: `${rootPath}/following`,
            render: () => <Timeline />,
          },
          followers: {
            name: "フォロワー",
            href: `${rootPath}/followers`,
            render: () => <Timeline />,
          },
        }}
      />
    </>
  );
}
