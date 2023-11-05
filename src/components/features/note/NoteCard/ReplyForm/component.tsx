"use client";
import { useReplyForm } from "@/components/features/note/NoteCard/useReplyForm";
import { NoteForm } from "@/components/features/note/NoteForm";
import { Card } from "@/components/ui/Card";

export function ReplyForm() {
  const replyForm = useReplyForm();
  if (!replyForm.isOpen) {
    return null;
  }
  return (
    <Card className="w-11/12">
      <NoteForm />
    </Card>
  );
}
