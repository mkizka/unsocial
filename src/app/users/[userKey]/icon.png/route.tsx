import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import { ImageResponse, NextResponse } from "next/server";
import sharp from "sharp";

import { userService } from "@/server/service";
import { createLogger } from "@/utils/logger";

const logger = createLogger("/users/[userKey]/icon.png");

const allowedSizes = [36, 64];

const headers = {
  "Content-Type": "image/png",
  // https://vercel.com/docs/concepts/functions/edge-functions/edge-caching#recommended-cache-control
  "Cache-Control": `public, max-age=0, s-maxage=31536000`, // 1年
};

const textImageResponse = (text: string, size: number) => {
  return new ImageResponse(
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
      headers,
    },
  );
};

const iconImageResponse = async (url: string, size: number) => {
  logger.info("アイコンfetch: " + url);
  const response = await fetch(url);
  const image = await sharp(await response.arrayBuffer())
    .resize(size, size)
    .png()
    .toBuffer();
  return new NextResponse(image, { headers });
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
  if (user.icon) {
    return iconImageResponse(user.icon, size);
  }
  return textImageResponse(user.preferredUsername || "", size);
}
