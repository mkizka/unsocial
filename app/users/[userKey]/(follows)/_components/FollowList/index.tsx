import { notFound } from "next/navigation";

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
  if (users.length === 0) {
    return <div>ユーザーが見つかりませんでした</div>;
  }
  return <UserList users={users} />;
}
