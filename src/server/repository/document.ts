import { prisma } from "@/utils/prisma";

export const findUnique = (documentId: string) => {
  return prisma.document.findUnique({
    where: { id: documentId },
  });
};
