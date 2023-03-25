import { exampleRouter } from "./routers/example";
import { followRouter } from "./routers/follow";
import { likeRouter } from "./routers/like";
import { noteRouter } from "./routers/note";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  note: noteRouter,
  follow: followRouter,
  like: likeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
