import type { NextPage } from "next";
import type { TypedResponse } from "next-runtime";
import { handle, json, notFound } from "next-runtime";

import { NoteCard } from "../../components/NoteCard";
import { prisma } from "../../server/db";
import { activityStreams } from "../../utils/activitypub";

type Props = Awaited<ReturnType<typeof handleProps>> extends TypedResponse<
  infer U
>
  ? U
  : never;

const NotePage: NextPage<Props> = ({ note }) => {
  return <NoteCard note={note} />;
};

export default NotePage;

const handleProps = async (noteId: string) => {
  const note = await prisma.note.findFirst({
    include: {
      user: {
        select: {
          name: true,
          preferredUsername: true,
          host: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
    where: {
      id: noteId,
    },
  });
  if (!note) {
    return notFound();
  }
  // TODO: publishedとcreatedAtどっちかにまとめる
  // @ts-ignore
  note.published = note.published.toISOString();
  // @ts-ignore
  note.createdAt = note.createdAt.toISOString();
  return json({ note }, 200);
};

const handleAp = async (noteId: string) => {
  const note = await prisma.note.findFirst({
    select: {
      id: true,
      userId: true,
      content: true,
      createdAt: true,
    },
    where: { id: noteId },
  });
  if (!note) {
    return notFound();
  }
  const activity = activityStreams.note(note);
  // @ts-ignore
  return json(activity, 200);
};

export const getServerSideProps = handle({
  get({ req, params }) {
    if (typeof params?.noteId != "string") {
      return notFound();
    }
    if (req.headers.accept?.includes("application/activity+json")) {
      return handleAp(params.noteId);
    }
    return handleProps(params.noteId);
  },
});
