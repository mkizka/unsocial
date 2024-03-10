import type { User } from "@prisma/client";

import type { UserIconProps } from "@/_shared/user/components/UserIcon";
import { UserIcon } from "@/_shared/user/components/UserIcon";
import { getUserId } from "@/_shared/utils/getUserId";

type Props = {
  user: UserIconProps["user"] & Pick<User, "name" | "host">;
};

export async function UserItem({ user }: Props) {
  return (
    <article className="mb-4 rounded p-2 shadow">
      <div className="flex w-full items-center">
        <UserIcon user={user} size={36} className="rounded-full" />
        <a href={`/${getUserId(user)}`} className="ml-2 flex hover:underline">
          <h1 className="mr-1 font-bold">{user.name}</h1>
          <div>{getUserId(user)}</div>
        </a>
      </div>
    </article>
  );
}
