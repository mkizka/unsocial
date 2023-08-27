import { UserCard } from "@/components/features/user/UserCard";
import { UserTab } from "@/components/features/user/UserTab";

type Props = {
  userId: string;
  currentTab: string;
};

export async function UserPage({ userId, currentTab }: Props) {
  const rootPath = `/${decodeURIComponent(userId)}`;
  return (
    <>
      <UserCard userId={userId} />
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
    </>
  );
}
