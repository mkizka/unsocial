import type { FormattedNoteCard } from "@/server/service/note";
import { fullUsername } from "@/utils/fullUsername";

type Props = {
  users: FormattedNoteCard["likes"][0]["user"][];
};

export function UserList({ users }: Props) {
  return (
    <div>
      {users.map((user) => (
        <p key={user.id}>{fullUsername(user)}</p>
      ))}
    </div>
  );
}
