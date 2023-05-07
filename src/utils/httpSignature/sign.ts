import type { AP } from "activitypub-core-types";
import crypto from "crypto";
import type { Session } from "next-auth";

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

// TODO: 理解する
// https://docs.joinmastodon.org/spec/security/
export const signActivity = (params: {
  sender: NonNullable<Session["user"]>;
  activity: AP.Activity;
  inboxUrl: URL;
}) => {
  const order = ["(request-target)", "host", "date", "digest"];
  const header = {
    host: params.inboxUrl.host,
    date: new Date().toUTCString(),
    digest: `SHA-256=${createDigest(params.activity)}`,
  };
  const headerToSign = {
    "(request-target)": `post ${params.inboxUrl.pathname}`,
    ...header,
  };
  const textToSign = textOf(headerToSign, order);
  const signature = getSignature(textToSign, params.sender.privateKey);
  return {
    ...header,
    signature:
      `keyId="https://${env.HOST}/users/${params.sender.id}#main-key",` +
      `algorithm="rsa-sha256",` +
      `headers="${order.join(" ")}",` +
      `signature="${signature}"`,
  };
};
