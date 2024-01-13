import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { prisma } from "@/_shared/utils/prisma";

type CreateFromActivityParams = {
  activity: apSchemaService.NoteActivity;
  userId: string;
  replyToId?: string;
};

export const create = ({
  activity,
  userId,
  replyToId,
}: CreateFromActivityParams) => {
  return prisma.note.create({
    data: {
      userId,
      url: activity.id,
      content: activity.content,
      publishedAt: activity.published,
      replyToId,
      attachments: {
        create: activity.attachment?.map((attachment) => ({
          url: attachment.url,
          mediaType: attachment.mediaType,
        })),
      },
    },
  });
};
