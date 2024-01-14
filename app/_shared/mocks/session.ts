import { userSessionService } from "@/_shared/user/services/userSessionService";

jest.mock("@/_shared/user/services/userSessionService");
export const mockedGetSessionUserId = jest.mocked(
  userSessionService.getSessionUserId,
);
// export const mockedGetSessionUser = jest.mocked(getSessionUser);
