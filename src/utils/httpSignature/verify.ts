import crypto from "crypto";
import { z } from "zod";

import { userService } from "@/server/service";

import { textOf } from "./utils";

const signatureSchema = z.object({
  keyId: z.string().url(),
  algorithm: z.literal<string>("rsa-sha256"),
  headers: z.string(),
  signature: z.string(),
});

/**
 * `keyId="https://example.com/users/foo#main-key",algorithm="rsa-sha256",...`
 * のような形式の文字列を
 * `{ keyId: "https://example.com/users/foo#main-key", algorithm: "rsa-sha256", ... }`
 * のようなオブジェクトに変換する
 */
const parse = (signature: string) => {
  const result: { [key: string]: string } = {};
  for (const column of signature.split(",")) {
    const [k, ..._v] = column.split("=");
    // signature="..." の ... は base64 形式で = が含まれる可能性があるため元に戻す
    const v = _v.join("=");
    if (k && v && v.startsWith('"') && v.endsWith('"')) {
      result[k] = v.slice(1, v.length - 1);
    }
  }
  return signatureSchema.safeParse(result);
};

const headersSchema = z
  .object({
    signature: z.string().transform((val, ctx) => {
      const parsed = parse(val);
      if (!parsed.success) {
        parsed.error.issues.forEach(ctx.addIssue);
        return z.NEVER;
      }
      return parsed.data;
    }),
  })
  .passthrough();

const createVerify = (textToSign: string) => {
  const verify = crypto.createVerify("sha256");
  verify.write(textToSign);
  verify.end();
  return verify;
};

const findOrFetchPublicKeyByKeyId = async (keyId: string) => {
  const actorId = new URL(keyId);
  actorId.hash = "";
  const user = await userService.findOrFetchUserByActorId(actorId);
  if (!user) {
    return null;
  }
  return user.publicKey;
};

type VerifyResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      reason: string;
    };

// TODO: digestがActivityと一致するかを検証する
export const verifyActivity = async (
  pathname: string,
  headers: Request["headers"],
): Promise<VerifyResult> => {
  const parsedHeaders = headersSchema.safeParse(Object.fromEntries(headers));
  if (!parsedHeaders.success) {
    return {
      isValid: false,
      reason:
        parsedHeaders.error.issues[0]?.message ||
        "リクエストヘッダーが不正でした",
    };
  }
  const { keyId, signature, headers: order } = parsedHeaders.data.signature;
  const publicKey = await findOrFetchPublicKeyByKeyId(keyId);
  if (!publicKey) {
    return { isValid: false, reason: "keyIdから公開鍵が取得できませんでした" };
  }
  const text = textOf({
    pathname,
    headers: parsedHeaders.data,
    order: order.split(" "),
  });
  const isValid = createVerify(text).verify(publicKey, signature, "base64");
  if (!isValid) {
    return { isValid, reason: "検証の結果不正と判断されました" };
  }
  return { isValid };
};
