// @ts-nocheck
// 参考:
// https://github.com/transmute-industries/RsaSignature2017
// https://github.com/misskey-dev/misskey/blob/30594dde181e9d151542c41c6f09e673fcbb3124/packages/backend/src/core/activitypub/LdSignatureService.ts
import crypto from "crypto";
import jsonld from "jsonld";

import { PREFETCHED_CONTEXTS } from "./contexts";

const canonize = async (data: jsonld.JsonLdDocument) => {
  return jsonld.canonize(data, {
    documentLoader: async (url) => {
      const prefetchedDocument = PREFETCHED_CONTEXTS[url];
      if (prefetchedDocument) {
        return {
          contextUrl: undefined,
          documentUrl: url,
          document: prefetchedDocument,
        };
      }
      throw new Error("Document not found: " + url);
    },
  });
};

const sha256 = (data: crypto.BinaryLike) => {
  const h = crypto.createHash("sha256");
  h.update(data);
  return h.digest("hex");
};

const createVerifyData = async (data: unknown, options: unknown) => {
  const transformedOptions = {
    ...options,
    "@context": "https://w3id.org/security/v1",
  };
  delete transformedOptions["type"];
  delete transformedOptions["id"];
  delete transformedOptions["signatureValue"];
  const canonizedOptions = await canonize(transformedOptions);
  const optionsHash = sha256(canonizedOptions);
  const transformedData = { ...data };
  delete transformedData["signature"];
  const cannonidedData = await canonize(transformedData);
  const documentHash = sha256(cannonidedData);
  const verifyData = `${optionsHash}${documentHash}`;
  return verifyData;
};

export const sign = async ({
  data,
  creator,
  domain,
  created,
  privateKey,
}: unknown) => {
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
  const toBeSigned = await createVerifyData(data, options);
  const signer = crypto.createSign("sha256");
  signer.update(toBeSigned);
  signer.end();
  const signature = signer.sign(privateKey);
  return {
    ...data,
    signature: {
      ...options,
      signatureValue: signature.toString("base64"),
    },
  };
};

export const verify = async ({ data, publicKey }: unknown) => {
  const toBeSigned = await createVerifyData(data, data.signature);
  const verifier = crypto.createVerify("sha256");
  verifier.update(toBeSigned);
  return verifier.verify(publicKey, data.signature.signatureValue, "base64");
};
