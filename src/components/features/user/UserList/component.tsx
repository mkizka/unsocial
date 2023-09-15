import { notFound, redirect } from "next/navigation";

import { followService, userService } from "@/server/service";
import { RedirectError } from "@/server/service/user/errors";

import { UserItem } from "./UserItem";

export type Props = {
  userKey: string;
  listBy: "followees" | "followers";
};

const findUsers = async ({ userKey, listBy }: Props) => {
  const user = await userService.findOrFetchUserByKey(userKey);
  if (user instanceof RedirectError) {
    redirect(user.url);
  }
  if (user instanceof Error) {
    notFound();
  }
  switch (listBy) {
    case "followees":
      return followService.findFollowees(user.id);
    case "followers":
      return followService.findFollowers(user.id);
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
