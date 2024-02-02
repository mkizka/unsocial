import type { noteCardFindService } from "@/_shared/note/services/noteCardFindService";
import { fullUsername } from "@/_shared/utils/fullUsername";

type Props = {
  users: noteCardFindService.NoteCard["likes"][0]["user"][];
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
