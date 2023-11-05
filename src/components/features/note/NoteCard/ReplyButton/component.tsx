"use client";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

import { useReplyForm } from "@/components/features/note/NoteCard/useReplyForm";
export function ReplyButton() {
  const replyForm = useReplyForm();
  return (
    <button onClick={replyForm.toggle}>
      <ChatBubbleLeftIcon className="h-5 w-5 text-dark transition-colors hover:text-gray" />
    </button>
  );
}
