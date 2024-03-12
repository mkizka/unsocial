import type { noteCardFindService } from "@/_shared/note/services/noteCardFindService";
import { getUserId } from "@/_shared/utils/getUserId";

type Props = {
  users: noteCardFindService.NoteCard["likes"][0]["user"][];
};

export function LikeUserList({ users }: Props) {
  return (
    <div>
      {users.map((user) => (
        <p key={user.id} data-testid="like-user">
          {getUserId(user)}
        </p>
      ))}
    </div>
  );
}
