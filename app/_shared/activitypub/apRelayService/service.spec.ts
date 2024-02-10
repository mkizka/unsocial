import { http, HttpResponse } from "msw";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { server } from "@/_shared/mocks/server";
import { userSignUpService } from "@/_shared/user/services/userSignUpService";

import { apReplayService } from ".";

jest.useFakeTimers();
jest.setSystemTime(new Date("2020-01-01T00:00:00Z"));

jest.mock("@/../package.json", () => ({
  version: "1.2.3",
}));

describe("apRelayService", () => {
  test("inboxUrlで指定したURLにActivityを配送する", async () => {
    // arrange
    const signer = await userSignUpService.signUpUser({
      preferredUsername: "user",
      password: "password",
    });
    const inboxUrl = "https://remote.example.com/inbox";
    const activity = { type: "Dummy" } as unknown as apSchemaService.Activity;
    const requestBodyFn = jest.fn();
    server.use(
      http.post(inboxUrl, async ({ request }) => {
        requestBodyFn(await request.json());
        return HttpResponse.text("Accepted", { status: 202 });
      }),
    );
    // act
    await apReplayService.relay({
      signer,
      activity,
      inboxUrl,
    });
    // assert
    expect(requestBodyFn).toHaveBeenCalledWith(activity);
  });
});
