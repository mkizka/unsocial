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

describe("RsaSignature2017", () => {
  test("supports sign and verify", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: mockedKeys.publickKey,
    } as User);
    // act
    const signedLinkedData = await sign({
      data: linkedData,
      creator: "http://localhost:1337/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const rsaSignature2017 = await verify(signedLinkedData);
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: true,
    });
  });
  test("supports optional domain", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: mockedKeys.publickKey,
    } as User);
    // act
    const signedLinkedData = await sign({
      data: linkedData,
      domain: "example.com",
      creator: "http://example.com/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const rsaSignature2017 = await verify(signedLinkedData);
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: true,
    });
  });
  test("公開鍵が取れなければエラーを返す", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: null,
    } as User);
    // act
    const signedLinkedData = await sign({
      data: linkedData,
      domain: "example.com",
      creator: "http://example.com/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const rsaSignature2017 = await verify(signedLinkedData);
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: false,
      reason: "公開鍵が見つかりませんでした",
    });
  });
  test("署名がなければエラーを返す", async () => {
    // act
    const rsaSignature2017 = await verify({});
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: false,
      reason: "署名がありません",
    });
  });
});
