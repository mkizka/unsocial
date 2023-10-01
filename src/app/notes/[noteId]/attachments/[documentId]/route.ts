import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import { documentService } from "@/server/service";

export async function GET(
  _: Request,
  { params }: { params: { documentId: string } },
) {
  const document = await documentService.findUnique(params.documentId);
  if (!document) {
    notFound();
  }
  const image = await fetch(document.url);
  return new NextResponse(await image.arrayBuffer(), {
    headers: {
      "Content-Type": document.mediaType,
      // https://vercel.com/docs/concepts/functions/edge-functions/edge-caching#recommended-cache-control
      "Cache-Control": `max-age=0, s-maxage=${60 * 60 * 3}`,
    },
  });
}
