import { type NextRequest, NextResponse } from "next/server";
import superjson from "superjson";
import { z } from "zod";

import { noteService } from "@/server/service";

const handler =
  <S extends z.Schema<unknown>, R>(
    schema: S,
    handler: (
      request: NextRequest,
      query: z.infer<S>,
    ) => Promise<NextResponse<R>>,
  ) =>
  async (request: NextRequest) => {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = schema.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return await handler(request, parsed.data);
  };

export const GET = handler(
  z.object({
    userId: z.string().optional(),
    since: z.coerce.date().optional(),
    until: z.coerce.date().optional(),
    count: z.coerce.number().default(10),
  }),
  async (_, query) => {
    const notes = await noteService.findManyNoteCards(query);
    return NextResponse.json(superjson.serialize(notes));
  },
);

export type TimelineResponse = Awaited<
  ReturnType<typeof noteService.findManyNoteCards>
>;
