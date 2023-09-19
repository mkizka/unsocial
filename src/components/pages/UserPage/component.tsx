import { UserTab } from "@/components/features/user/UserTab";

type Props = {
  userKey: string;
  currentTab: string;
};

export async function UserPage({ userKey, currentTab }: Props) {
  const rootPath = `/${decodeURIComponent(userKey)}`;
  return (
    <UserTab
      current={currentTab}
      tabs={{
        root: {
          name: "投稿",
          href: rootPath,
          render: () => <p>未実装</p>,
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
