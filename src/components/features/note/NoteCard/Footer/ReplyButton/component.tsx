import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

type Props = {
  onClick: () => void;
};

export function ReplyButton({ onClick }: Props) {
  return (
    <button onClick={onClick}>
      <ChatBubbleLeftIcon className="h-5 w-5 text-dark transition-colors hover:text-gray" />
    </button>
  );
}
