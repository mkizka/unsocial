import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const noteRouter = createTRPCRouter({
  find: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany({
      include: {
        user: {
          select: {
            name: true,
            preferredUsername: true,
            host: true,
          },
        },
        likes: true,
      },
    });
  }),
  findSelf: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
