import { notFound } from "next/navigation";

import { Card } from "@/_shared/ui/Card";
import { UserList } from "@/_shared/user/components/UserList";
import { userFindService } from "@/_shared/user/services/userFindService";

import { followFindService } from "./findFollowService";

type Props = {
  userKey: string;
  listBy: "followees" | "followers";
};

const findUsers = async ({ userKey, listBy }: Props) => {
  const user = await userFindService.findOrFetchUserByKey(userKey);
  if (user instanceof Error) {
    notFound();
  }
  switch (listBy) {
    case "followees":
      return followFindService.followees(user.id);
    case "followers":
      return followFindService.followers(user.id);
    default:
      notFound();
  }
};

export async function FollowList(props: Props) {
  const users = await findUsers(props);

  return (
    <div className="space-y-1">
      <Card className="font-bold">
        <h2> {props.listBy === "followees" ? "フォロー" : "フォロワー"}</h2>
      </Card>
      {users.length === 0 && (
        <p className="p-4 text-center">ユーザーが見つかりませんでした</p>
      )}
      <UserList users={users} />
    </div>
  );
}
