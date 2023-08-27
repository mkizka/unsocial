import type { NoteCard } from "@/server/service/note";

type Props = {
  users: NoteCard["likes"][0]["user"][];
};

export function UserList({ users }: Props) {
  return (
    <div>
      {users.map((user) => (
        <p key={user.id}>
          @{user.preferredUsername}@{user.host}
        </p>
      ))}
    </div>
  );
}
