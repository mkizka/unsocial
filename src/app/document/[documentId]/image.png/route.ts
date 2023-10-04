import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { documentService } from "@/server/service";
import { fetcher } from "@/utils/fetcher";

export async function GET(
  _: Request,
  { params }: { params: { documentId: string } },
) {
  const document = await documentService.findUnique(params.documentId);
  if (!document) {
    notFound();
  }
  const response = await fetcher(document.url);
  if (response instanceof Error) {
    notFound();
  }
  const image = await sharp(await response.arrayBuffer())
    // 600px - 16px * 2(横幅パディング) - 48px(左側のアイコン幅) = 520px
    .resize(520, null, { fit: "inside" })
    .toBuffer();
  return new NextResponse(image, {
    headers: {
      "Content-Type": document.mediaType,
      "Cache-Control": "public, max-age=31536000, immutable", // 1年
    },
  });
}
