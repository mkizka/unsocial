import type { User } from "@prisma/client";

import type { UserIconProps } from "@/_shared/user/components/UserIcon";
import { UserIcon } from "@/_shared/user/components/UserIcon";
import { fullUsername } from "@/_shared/utils/fullUsername";

type Props = {
  user: UserIconProps["user"] & Pick<User, "name" | "host">;
};

export async function UserItem({ user }: Props) {
  return (
    <article className="mb-4 rounded bg-primary-light p-2 shadow">
      <div className="flex w-full items-center">
        <UserIcon user={user} size={36} className="rounded-full" />
        <a
          href={`/${fullUsername(user)}`}
          className="ml-2 flex hover:underline"
        >
          <h1 className="text-md mr-1 font-bold">{user.name}</h1>
          <div className="text-gray">{fullUsername(user)}</div>
        </a>
      </div>
    </article>
  );
}
