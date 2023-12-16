import crypto from "crypto";

import { createVerifyData } from "./common";

type SignOptinos = {
  activity: object;
  creator: string;
  domain?: string;
  created?: Date;
  privateKey: string;
};

// 参考:
//   https://github.com/transmute-industries/RsaSignature2017/blob/5cd9f90989e313d5039a4e63cdb7677ae8467b02/src/index.js
//   https://github.com/misskey-dev/misskey/blob/776eea736a2607c62145c01b48a8271dd355f006/packages/backend/src/core/activitypub/LdSignatureService.ts
const sign = async ({
  activity,
  creator,
  domain,
  created,
  privateKey,
}: SignOptinos) => {
  const options = {
    type: "RsaSignature2017",
    creator,
    domain,
    nonce: crypto.randomBytes(16).toString("hex"),
    created: created || new Date().toISOString(),
  };
  if (!domain) {
    delete options.domain;
  }
  const toBeSigned = await createVerifyData(activity, options);
  const signer = crypto.createSign("sha256");
  signer.update(toBeSigned);
  signer.end();
  const signature = signer.sign(privateKey);
  return {
    ...activity,
    signature: {
      ...options,
      signatureValue: signature.toString("base64"),
    },
  };
};
