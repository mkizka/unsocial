import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

type Props = {
  noteId: string;
};

export function ReplyButton({ noteId }: Props) {
  return (
    <ChatBubbleLeftIcon className="h-5 w-5 text-dark transition-colors hover:text-gray" />
  );
}
