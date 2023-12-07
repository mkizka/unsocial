import { notFound } from "next/navigation";

import { userService } from "@/server/service/user";

import { followFindService } from "./findFollowService";
import { UserItem } from "./UserItem";

export type Props = {
  userKey: string;
  listBy: "followees" | "followers";
};

const findUsers = async ({ userKey, listBy }: Props) => {
  const user = await userService.findOrFetchUserByKey(userKey);
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

export async function UserList(props: Props) {
  const users = await findUsers(props);
  if (users.length === 0) {
    return <div>ユーザーが見つかりませんでした</div>;
  }
  return users.map((user) => <UserItem key={user.id} user={user} />);
}
