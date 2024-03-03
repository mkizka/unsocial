import crypto from "crypto";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { createDigest, textOf } from "@/_shared/activitypub/httpSignatureUtils";
import { userFindService } from "@/_shared/user/services/userFindService";

const signatureSchema = z.object({
  keyId: z.string().url(),
  algorithm: z.union([z.literal("rsa-sha256"), z.literal("hs2019")]),
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
  const user = await userFindService.findOrFetchUserByActor(
    actorUrl.toString(),
  );
  if (user instanceof Error) {
    return null;
  }
  return user;
};

const getActor = async (request: NextRequest) => {
  const parsedActivity = z
    .object({
      actor: z.string().url(),
    })
    .safeParse(await request.clone().json());
  if (!parsedActivity.success) {
    return null;
  }
  return parsedActivity.data.actor;
};

type VerifyResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      reason: string;
    };

export const verifyRequest = async (
  request: NextRequest,
): Promise<VerifyResult> => {
  const parsedHeaders = headersSchema.safeParse(
    Object.fromEntries(request.headers),
  );
  if (!parsedHeaders.success) {
    return {
      isValid: false,
      reason:
        parsedHeaders.error.issues[0]?.message ||
        "リクエストヘッダーが不正でした",
    };
  }
  const requestBody = await request.clone().text();
  if (parsedHeaders.data.digest !== `SHA-256=${createDigest(requestBody)}`) {
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
  if (!keyIdUser.actorUrl) {
    // keyIdはリモートユーザーなのでありえない動作だが、
    // keyIdとactorの比較で null === null とならないようにするためチェック
    return {
      isValid: false,
      reason: "keyIdからactorが取得できませんでした",
    };
  }
  const requestActor = await getActor(request);
  if (keyIdUser.actorUrl !== requestActor) {
    return {
      isValid: false,
      reason: "keyIdに基づくユーザーとactorが一致しませんでした",
    };
  }
  const text = textOf({
    pathname: request.nextUrl.pathname,
    headers: parsedHeaders.data,
    order: order.split(" "),
    method: request.method,
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
