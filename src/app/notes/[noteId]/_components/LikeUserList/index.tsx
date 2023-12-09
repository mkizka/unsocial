import type { NoteCard } from "@/app/_shared/service/note";
import { fullUsername } from "@/utils/fullUsername";

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
