import { mockedKeys } from "@/_shared/mocks/keys";

import { sign, verify } from "./rsaSignature2017";

const linkedData = {
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
  ],
  type: "Dummy",
};

describe("RsaSignature2017", () => {
  it("supports sign and verify", async () => {
    const signedLinkedData = await sign({
      data: linkedData,
      creator: "http://localhost:1337/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const verified = await verify({
      data: signedLinkedData,
      publicKey: mockedKeys.publickKey,
    });
    expect(verified).toBe(true);
  });

  it("supports optional domain", async () => {
    const signedLinkedData = await sign({
      data: linkedData,
      domain: "example.com",
      creator: "http://example.com/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const verified = await verify({
      data: signedLinkedData,
      publicKey: mockedKeys.publickKey,
    });
    expect(verified).toBe(true);
  });
});
