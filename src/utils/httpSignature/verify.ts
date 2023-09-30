import crypto from "crypto";
import { z } from "zod";

import { userService } from "@/server/service";

import { createDigest, textOf } from "./utils";

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
    digest: z.string().transform((val, ctx) => {
      if (!val.startsWith("SHA-256=")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "digestのアルゴリズムがSHA-256ではありません",
        });
        return z.NEVER;
      }
      return val;
    }),
  })
  .passthrough();

const createVerify = (textToSign: string) => {
  const verify = crypto.createVerify("sha256");
  verify.write(textToSign);
  verify.end();
  return verify;
};

const findOrFetchUserByKeyId = async (keyId: string) => {
  const actorUrl = new URL(keyId);
  actorUrl.hash = "";
  const user = await userService.findOrFetchUserByActor(actorUrl.toString());
  if (user instanceof Error) {
    return null;
  }
  return user;
};

type VerifyResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      reason: string;
    };

type VerifyActivityParams = {
  pathname: string;
  headers: Request["headers"];
  activity: { actor: string };
};

export const verifyActivity = async ({
  pathname,
  headers,
  activity,
}: VerifyActivityParams): Promise<VerifyResult> => {
  const parsedHeaders = headersSchema.safeParse(Object.fromEntries(headers));
  if (!parsedHeaders.success) {
    return {
      isValid: false,
      reason:
        parsedHeaders.error.issues[0]?.message ||
        "リクエストヘッダーが不正でした",
    };
  }
  if (parsedHeaders.data.digest !== `SHA-256=${createDigest(activity)}`) {
    return {
      isValid: false,
      reason: "ActivityがDigestと一致しませんでした",
    };
  }
  const { keyId, signature, headers: order } = parsedHeaders.data.signature;
  const keyIdUser = await findOrFetchUserByKeyId(keyId);
  if (!keyIdUser?.publicKey) {
    return {
      isValid: false,
      reason: "keyIdから公開鍵が取得できませんでした",
    };
  }
  if (keyIdUser.actorUrl !== activity.actor) {
    return {
      isValid: false,
      reason: "keyIdに基づくユーザーとactorが一致しませんでした",
    };
  }
  const text = textOf({
    pathname,
    headers: parsedHeaders.data,
    order: order.split(" "),
  });
  const isValid = createVerify(text).verify(
    keyIdUser.publicKey,
    signature,
    "base64",
  );
  if (!isValid) {
    return {
      isValid,
      reason: "検証の結果不正と判断されました",
    };
  }
  return { isValid };
};
