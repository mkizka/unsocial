import type { NextRequest } from "next/server";
import { ImageResponse } from "next/server";

export const runtime = "edge";

export async function GET({ nextUrl }: NextRequest) {
  const text = nextUrl.searchParams.get("text");
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 60,
        }}
      >
        {text?.slice(0, 2) || ""}
      </div>
    ),
    {
      width: 100,
      height: 100,
    }
  );
}
