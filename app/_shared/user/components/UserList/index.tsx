import type { User } from "@prisma/client";

import { Card } from "@/_shared/ui/Card";
import type { UserIconProps } from "@/_shared/user/components/UserIcon";
import { UserIcon } from "@/_shared/user/components/UserIcon";
import { getUserId } from "@/_shared/utils/getUserId";

type UserItem = UserIconProps["user"] & Pick<User, "id" | "name" | "host">;

function UserItem({ user }: { user: UserItem }) {
  return (
    <Card className="p-2">
      <div className="flex w-full items-center">
        <UserIcon user={user} size={36} className="rounded-full" />
        <a href={`/${getUserId(user)}`} className="ml-2 flex hover:underline">
          <h1 className="mr-1 font-bold">{user.name}</h1>
          <div>{getUserId(user)}</div>
        </a>
      </div>
    </Card>
  );
}

export async function UserList({ users }: { users: UserItem[] }) {
  return users.map((user) => <UserItem key={user.id} user={user} />);
}
