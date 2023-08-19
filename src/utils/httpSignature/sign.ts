import type { AP } from "activitypub-core-types";
import crypto from "crypto";

import { env } from "../env";
import { textOf } from "./utils";

const createDigest = (activity: object) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(activity)!)
    .digest("base64");
};

const getSignature = (textToSign: string, privateKey: string) => {
  const sig = crypto.createSign("sha256").update(textToSign).end();
  return sig.sign(privateKey, "base64");
};

export type SignActivityParams = {
  userId: string;
  privateKey: string;
  activity: AP.Activity;
  inboxUrl: URL;
};

export const signActivity = (params: SignActivityParams) => {
  const order = ["(request-target)", "host", "date", "digest"];
  const headers = {
    host: params.inboxUrl.host,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createDigest(params.activity)}`,
  };
  const textToSign = textOf({
    pathname: params.inboxUrl.pathname,
    headers,
    order,
  });
  const signature = getSignature(textToSign, params.privateKey);
  return {
    ...headers,
    signature:
      `keyId="https://${env.HOST}/users/${params.userId}/activity#main-key",` +
      `algorithm="rsa-sha256",` +
      `headers="${order.join(" ")}",` +
      `signature="${signature}"`,
  };
};
