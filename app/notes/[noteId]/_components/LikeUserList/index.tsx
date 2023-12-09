import type { NoteCard } from "@/_shared/service/note";
import { fullUsername } from "@/_shared/utils/fullUsername";

type Props = {
  users: NoteCard["likes"][0]["user"][];
};

export function LikeUserList({ users }: Props) {
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
