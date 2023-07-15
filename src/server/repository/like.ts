import { cache } from "react";

import { prisma } from "@/utils/prisma";

type CreateParams = {
  noteId: string;
  userId: string;
  content: string;
};

export const create = cache((params: CreateParams) => {
  return prisma.like.create({
    data: params,
  });
});

type RemoveParams = {
  noteId: string;
  userId: string;
};

export const remove = cache((params: RemoveParams) => {
  return prisma.like.deleteMany({
    where: params,
  });
});
