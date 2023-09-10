import type { User } from "@prisma/client";

import type { UserIconProps } from "../../UserIcon";
import { UserIcon } from "../../UserIcon";

export type Props = {
  user: UserIconProps["user"] & Pick<User, "name" | "host">;
};

export async function UserItem({ user }: Props) {
  return (
    <article className="mb-4 rounded bg-primary-light p-2 pl-4 shadow">
      <div className="mb-2 flex w-full items-center">
        <UserIcon user={user} width={32} height={32} className="rounded-full" />
        <a
          href={`/@${user.preferredUsername}@${user.host}`}
          className="ml-4 block hover:underline"
        >
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-gray">
            @{user.preferredUsername}@{user.host}
          </div>
        </a>
      </div>
    </article>
  );
}
