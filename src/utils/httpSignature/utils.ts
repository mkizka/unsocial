import crypto from "crypto";

type Params = {
  pathname: string;
  headers: { [key: string]: unknown };
  order: string[];
};

/**
 * order(リクエストヘッダーのSignatureをパースして取得したheadersの値) の順で文字列を作る
 */
export const textOf = ({ pathname, headers, order }: Params) => {
  const headerToSign = {
    "(request-target)": `post ${pathname}`,
    ...headers,
  };
  return order
    .filter((key): key is keyof typeof headerToSign => key in headerToSign)
    .map((key) => `${key}: ${headerToSign[key]}`)
    .join("\n");
};

export const createDigest = (text: string) => {
  return crypto.createHash("sha256").update(text).digest("base64");
};
