import { action as deleteAction } from "./DeleteButton/action";
import { action as likeAction } from "./LikeButton/action";
import { NoteCard, type NoteCardProps } from "./NoteCard";

type Props = Omit<NoteCardProps, "onLike" | "onDelete">;

function NoteCardContainer(props: Props) {
  console.log(props);
  return (
    <NoteCard
      {...props}
      onLike={() =>
        likeAction({
          noteId: props.note.id,
          content: "👍",
        })
      }
      onDelete={() => deleteAction(props.note.id)}
    />
  );
}

export { NoteCardContainer as NoteCard };
