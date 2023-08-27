import type { Props as UserCardProps } from "../features/user/UserCard";
import { UserCard } from "../features/user/UserCard";

type Props = {
  users: UserCardProps["user"][];
};

export function UserList({ users }: Props) {
  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
