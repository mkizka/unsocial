import type { NoteCard } from "@/server/service/note";
import { fullUsername } from "@/utils/fullUsername";

type Props = {
  users: NoteCard["likes"][0]["user"][];
};

export function UserList({ users }: Props) {
  return (
    <div>
      {users.map((user) => (
        <p key={user.id} data-testid="like-user">
          {fullUsername(user)}
        </p>
      ))}
    </div>
  );
}
