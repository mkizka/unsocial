import crypto from "crypto";

export const getIconHash = (icon: string) => {
  return crypto.createHash("md5").update(icon).digest("hex");
};

export const getIconPath = (
  iconHash: string | null | undefined,
  size: number,
) => {
  return `/icons/${iconHash ?? "default"}.webp?size=${size}`;
};
