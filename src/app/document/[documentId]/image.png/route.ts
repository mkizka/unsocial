import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { documentService } from "@/server/service";
import { fetcher } from "@/utils/fetcher";

const resize = (buffer: ArrayBuffer) => {
  return (
    sharp(buffer)
      // 600px - 16px * 2(横幅パディング) - 48px(左側のアイコン幅) = 520px
      .resize(520, null, { fit: "inside" })
      .toBuffer()
  );
};

export async function GET(
  request: NextRequest,
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
  const buffer = await response.arrayBuffer();
  const image =
    request.nextUrl.searchParams.get("format") === "original"
      ? buffer
      : await resize(buffer);
  return new NextResponse(image, {
    headers: {
      "Content-Type": document.mediaType,
      "Cache-Control": "public, max-age=31536000, immutable", // 1年
    },
  });
}
