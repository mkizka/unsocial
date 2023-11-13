import { NotePage } from "@/components/pages/NotePage";

export default function Page({
  params,
  searchParams,
}: {
  params: { noteId: string };
  searchParams: { reply?: string };
}) {
  return (
    <NotePage
      noteId={params.noteId}
      shouldFocusToReplyForm={"reply" in searchParams}
    />
  );
}
