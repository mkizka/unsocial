import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { documentService } from "@/server/service";
import { fetcher } from "@/utils/fetcher";

const convertWebp = (buffer: ArrayBuffer, options: { resize: boolean }) => {
  const image = sharp(buffer);
  if (options.resize) {
    // 600px - 16px * 2(横幅パディング) - 48px(左側のアイコン幅) = 520px
    return image.resize(520, null, { fit: "inside" }).webp().toBuffer();
  }
  return image.webp().toBuffer();
};

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  const document = await documentService.findUnique(params.documentId);
  if (!document) {
    notFound();
  }
  const response = await fetcher(document.url, {
    next: {
      revalidate: 3600,
    },
  });
  if (response instanceof Error) {
    notFound();
  }
  const buffer = await response.arrayBuffer();
  const image = await convertWebp(buffer, {
    resize: request.nextUrl.searchParams.get("format") !== "original",
  });
  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable", // 1年
    },
  });
}
