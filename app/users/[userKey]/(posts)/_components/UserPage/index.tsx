import type { User } from "@prisma/client";

import { Timeline } from "@/_shared/note/components/Timeline";

import { UserTab } from "./UserTab";

type Props = {
  user: User;
  currentTab: string;
};

export async function UserPage({ user, currentTab }: Props) {
  const rootPath = `/@${user.preferredUsername}`;
  return (
    <UserTab
      current={currentTab}
      tabs={{
        root: {
          name: "投稿",
          href: rootPath,
          render: () => <Timeline user={user} />,
        },
        likes: {
          name: "いいね",
          href: `${rootPath}/likes`,
          render: () => <p>未実装</p>,
        },
      }}
    />
  );
}
