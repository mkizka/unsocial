import { type NextRequest, NextResponse } from "next/server";
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
    const query = Object.fromEntries(request.nextUrl.searchParams.entries());
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
    since: z.coerce.date().optional(),
    until: z.coerce.date().optional(),
    count: z.coerce.number().default(10),
  }),
  async (_, query) => {
    const notes = await noteService.findManyNoteCards(query);
    return NextResponse.json(notes);
  },
);

type InferResponse<
  T extends (request: NextRequest) => Promise<NextResponse<unknown>>,
> = Awaited<ReturnType<T>> extends NextResponse<infer Response>
  ? Response extends { error: unknown }
    ? never
    : Response
  : never;

export type TimelineResponse = InferResponse<typeof GET>;
