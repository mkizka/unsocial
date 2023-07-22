import { notFound } from "next/navigation";

import { Timeline } from "@/components/Timeline";
import { UserCard } from "@/components/UserCard";
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
            render: () => <Timeline notes={notes} />,
          },
          likes: {
            name: "いいね",
            href: `${rootPath}/likes`,
            render: () => <Timeline notes={notes} />,
          },
          following: {
            name: "フォロー",
            href: `${rootPath}/following`,
            render: () => <Timeline notes={notes} />,
          },
          followers: {
            name: "フォロワー",
            href: `${rootPath}/followers`,
            render: () => <Timeline notes={notes} />,
          },
        }}
      />
    </>
  );
}
