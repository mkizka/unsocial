import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { fetcher } from "@/utils/fetcher";
import { prisma } from "@/utils/prisma";

sharp.cache(false);

const convertWebp = (buffer: ArrayBuffer, options: { resize: boolean }) => {
  const image = sharp(buffer);
  if (options.resize) {
    return image.resize(400, null, { fit: "inside" }).webp().toBuffer();
  }
  return image.webp().toBuffer();
};

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } },
) {
  const document = await prisma.document.findUnique({
    where: { id: params.documentId },
  });
  if (!document) {
    notFound();
  }
  const response = await fetcher(document.url);
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
