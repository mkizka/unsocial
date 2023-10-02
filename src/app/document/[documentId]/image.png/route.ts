import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { documentService } from "@/server/service";
import { createLogger } from "@/utils/logger";

const logger = createLogger("/document/[documentId]/image.png");

export async function GET(
  _: Request,
  { params }: { params: { documentId: string } },
) {
  const document = await documentService.findUnique(params.documentId);
  if (!document) {
    notFound();
  }
  logger.info("画像fetch: " + document.url);
  const response = await fetch(document.url);
  const image = await sharp(await response.arrayBuffer())
    // 600px - 16px * 2(横幅パディング) - 48px(左側のアイコン幅) = 520px
    .resize(520, null, { fit: "inside" })
    .toBuffer();
  return new NextResponse(image, {
    headers: {
      "Content-Type": document.mediaType,
      // https://vercel.com/docs/concepts/functions/edge-functions/edge-caching#recommended-cache-control
      "Cache-Control": `max-age=0, s-maxage=31536000`, // 1年
    },
  });
}
