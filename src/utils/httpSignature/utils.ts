import crypto from "crypto";

type Params = {
  pathname: string;
  headers: { [key: string]: unknown };
  order: string[];
  method: string;
};

/**
 * order(リクエストヘッダーのSignatureをパースして取得したheadersの値) の順で文字列を作る
 */
export const textOf = ({ pathname, headers, order, method }: Params) => {
  const headerToSign = {
    "(request-target)": `${method.toLowerCase()} ${pathname}`,
    ...headers,
  };
  return order
    .filter((key): key is keyof typeof headerToSign => key in headerToSign)
    .map((key) => `${key}: ${headerToSign[key]}`)
    .join("\n");
};

export const createDigest = (body: string) => {
  return crypto.createHash("sha256").update(body).digest("base64");
};
