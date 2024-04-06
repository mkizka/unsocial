import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { fetcher } from "@/_shared/utils/fetcher";
import { prisma } from "@/_shared/utils/prisma";

const allowedSizes = [
  36, // タイムラインなど
  64, // ユーザーページ
  100, // 設定ページ
  128, // Activity
];

const defaultIconImage = async (size: number) => {
  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          fontSize: Math.floor(size * 0.7),
        }}
      >
        🙂
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
  return sharp(await response.arrayBuffer())
    .webp()
    .toBuffer();
};

const fetchIconImage = async (url: string, size: number) => {
  const response = await fetcher(url);
  if (response instanceof Error) {
    notFound();
  }
  return sharp(await response.arrayBuffer())
    .resize(size, size)
    .webp()
    .toBuffer();
};

const getIconImage = async (filename: string, size: number) => {
  const [hash, ext] = filename.split(".");
  if (ext !== "webp") {
    notFound();
  }
  if (hash === "default") {
    return defaultIconImage(size);
  }
  const user = await prisma.user.findFirst({
    where: {
      iconHash: hash,
    },
  });
  if (!user || !user.icon) {
    return defaultIconImage(size);
  }
  return fetchIconImage(user.icon, size);
};

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } },
) {
  const size = Number(
    request.nextUrl.searchParams.get("size") ?? allowedSizes[0],
  );
  if (!allowedSizes.includes(size)) {
    notFound();
  }
  const image = await getIconImage(params.filename, size);
  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=0, s-maxage=31536000, immutable", // 1年
    },
  });
}
