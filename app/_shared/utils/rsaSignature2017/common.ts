import crypto from "crypto";
import jsonld from "jsonld";

const sha256 = (data: string) => {
  const h = crypto.createHash("sha256");
  h.update(data);
  return h.digest("hex");
};

export const createVerifyData = async (data: object, options: object) => {
  const transformedOptions = {
    ...options,
    "@context": "https://w3id.org/identity/v1",
  };
  delete transformedOptions["type"];
  delete transformedOptions["id"];
  delete transformedOptions["signatureValue"];
  const canonizedOptions = await jsonld.canonize(transformedOptions);
  const optionsHash = await sha256(canonizedOptions);
  const transformedData = { ...data };
  delete transformedData["signature"];
  const cannonidedData = await jsonld.canonize(transformedData);
  const documentHash = await sha256(cannonidedData);
  const verifyData = `${optionsHash}${documentHash}`;
  return verifyData;
};
