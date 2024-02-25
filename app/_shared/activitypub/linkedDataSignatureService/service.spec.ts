import type { User } from "@prisma/client";

import { mockedKeys } from "@/_shared/mocks/keys";
import { userFindService } from "@/_shared/user/services/userFindService";

import { linkedDataSignatureService } from ".";
import mastodonFollowJson from "./__fixtures__/Mastodon.Follow.json";
import mastodonProfileJson from "./__fixtures__/Mastodon.Profile.json";
import misskeyCreateJson from "./__fixtures__/Misskey.Create.json";
import misskeyProfileJson from "./__fixtures__/Misskey.Profile.json";
const linkedData = {
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
  ],
  type: "Dummy",
  content: "content",
};

jest.mock("@/_shared/user/services/userFindService");
const mockedFindOrFetchUserByActor = jest.mocked(
  userFindService.findOrFetchUserByActor,
);

describe("linkedDataSignatureService", () => {
  test("supports sign and verify", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: mockedKeys.publickKey,
    } as User);
    // act
    const signedLinkedData = await linkedDataSignatureService.sign({
      data: linkedData,
      creator: "http://localhost:1337/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const rsaSignature2017 =
      await linkedDataSignatureService.verify(signedLinkedData);
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
    const signedLinkedData = await linkedDataSignatureService.sign({
      data: linkedData,
      domain: "example.com",
      creator: "http://example.com/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const rsaSignature2017 =
      await linkedDataSignatureService.verify(signedLinkedData);
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: true,
    });
  });
  test("Mastodonの署名を検証できる", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: mastodonProfileJson.publicKey.publicKeyPem,
    } as User);
    // act
    const rsaSignature2017 =
      await linkedDataSignatureService.verify(mastodonFollowJson);
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: true,
    });
  });
  test("Misskeyの署名を検証できる", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: misskeyProfileJson.publicKey.publicKeyPem,
    } as User);
    // act
    const rsaSignature2017 =
      await linkedDataSignatureService.verify(misskeyCreateJson);
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: true,
    });
  });
  test("内容が改ざんされていればエラーを返す", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: mockedKeys.publickKey,
    } as User);
    // act
    const signedLinkedData = await linkedDataSignatureService.sign({
      data: linkedData,
      domain: "example.com",
      creator: "http://example.com/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const rsaSignature2017 = await linkedDataSignatureService.verify({
      ...signedLinkedData,
      // @ts-expect-error
      content: "changed",
    });
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: false,
      reason: "検証の結果不正と判断されました",
    });
  });
  test("公開鍵が取れなければエラーを返す", async () => {
    // arrange
    mockedFindOrFetchUserByActor.mockResolvedValue({
      publicKey: null,
    } as User);
    // act
    const signedLinkedData = await linkedDataSignatureService.sign({
      data: linkedData,
      domain: "example.com",
      creator: "http://example.com/user/did:example:123#main-key",
      privateKey: mockedKeys.privateKey,
    });
    const rsaSignature2017 =
      await linkedDataSignatureService.verify(signedLinkedData);
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: false,
      reason: "公開鍵が見つかりませんでした",
    });
  });
  test("署名がなければエラーを返す", async () => {
    // act
    const rsaSignature2017 = await linkedDataSignatureService.verify({});
    // assert
    expect(rsaSignature2017).toEqual({
      isValid: false,
      reason: "署名がありません",
    });
  });
});
