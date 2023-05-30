import type { Props as UserCardProps } from "../UserCard";
import { UserCard } from "../UserCard";

type Props = {
  users: UserCardProps["user"][];
};

export function UserList({ users }: Props) {
  return (
    <div>
      {users.map((user) => (
        // @ts-expect-error
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
