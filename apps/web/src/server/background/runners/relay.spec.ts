import { fetcher } from "@/utils/fetcher";
import { mockedKeys } from "@/utils/httpSignature/__fixtures__/keys";

import { relayActivity } from "./relay";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-01T00:00:00Z"));

jest.mock("@/utils/fetcher");
const mockedFetcher = jest.mocked(fetcher);

describe("relayActivity", () => {
  test("正常系", async () => {
    // arrange
    const dummySender = { id: "dummy", privateKey: mockedKeys.privateKey };
    // act
    await relayActivity({
      sender: dummySender,
      // @ts-ignore
      activity: { type: "Dummy" },
    });
    // arrange
    expect(mockedFetcher.mock.lastCall).toMatchInlineSnapshot(`
      [
        "https://misskey.localhost/inbox",
        {
          "body": "{"type":"Dummy"}",
          "headers": {
            "Accept": "application/activity+json",
            "date": "Wed, 01 Jan 2020 00:00:00 GMT",
            "digest": "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
            "host": "misskey.localhost",
            "signature": "keyId="https://myhost.example.com/users/dummy#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="PWVjjwtTTcPxnTHwIHMBYwuzPC+jiO7UdDrMyCDF2ELMxFIsdT2x+0YHO7gZzxElrFiwrFoaDLcjoW2CS7mreEUgQoT76Z5K/BwcJB1335Q3OU1F9sybeyziAB1+Qn7bajuXDctYoAb/1p7cOS+Vlc2fpecgU0RTzFZ8f0wEi3wVXQ3BXxxg3uvlTEjZXza5dh6Ia9rDAd+PAl/LJIkQubklXIibfi9SelHkdXJKwxYXZmwuZ13vy1kmzVBzGS3CtYR0qoeBaAYfUmZS1wHD+PIRjeIHzGqtN5kV4uNypm5/6pxLbz+awQPVnweuS4gGbnOJzkbLuZbORRoD3g=="",
          },
          "method": "POST",
        },
      ]
    `);
  });
});
