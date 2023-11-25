import crypto from "crypto";

export const getIconHash = (icon: string) => {
  return crypto.createHash("md5").update(icon).digest("hex");
};
