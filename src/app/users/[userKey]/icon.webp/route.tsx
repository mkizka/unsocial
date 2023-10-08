import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { ImageResponse, NextResponse } from "next/server";
import sharp from "sharp";

import { userService } from "@/server/service";
import { fetcher } from "@/utils/fetcher";

const allowedSizes = [36, 64];

const generateTextImage = async (text: string, size: number) => {
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
        {text.slice(0, 2)}
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

export async function GET(
  request: NextRequest,
  { params }: { params: { userKey: string } },
) {
  const size =
    Number(request.nextUrl.searchParams.get("size")) ?? allowedSizes[0];
  if (!allowedSizes.includes(size)) {
    notFound();
  }
  const user = await userService.findOrFetchUserByKey(params.userKey);
  if (user instanceof Error) {
    notFound();
  }
  const image = user.icon
    ? await fetchIconImage(user.icon, size)
    : await generateTextImage(user.preferredUsername || "", size);
  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable", // 1年
    },
  });
}
