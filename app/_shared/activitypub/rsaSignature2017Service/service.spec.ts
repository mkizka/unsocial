import type { User } from "@prisma/client";

import { mockedKeys } from "@/_shared/mocks/keys";
import { userFindService } from "@/_shared/user/services/userFindService";

import { sign, verify } from "./service";

const linkedData = {
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
  ],
  type: "Dummy",
};

jest.mock("@/_shared/user/services/userFindService");
const mockedFindOrFetchUserByActor = jest.mocked(
  userFindService.findOrFetchUserByActor,
);
mockedFindOrFetchUserByActor.mockResolvedValue({
  publicKey: mockedKeys.publickKey,
} as User);

describe("RsaSignature2017", () => {
  it("supports sign and verify", async () => {
    const signedLinkedData = await sign({
      data: linkedData,
      creator: "http://localhost:1337/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const verified = await verify(signedLinkedData);
    expect(verified).toBe(true);
  });

  it("supports optional domain", async () => {
    const signedLinkedData = await sign({
      data: linkedData,
      domain: "example.com",
      creator: "http://example.com/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const verified = await verify(signedLinkedData);
    expect(verified).toBe(true);
  });
});
