import { getSessionUserId } from "@/_shared/utils/session";

jest.mock("@/_shared/utils/session");
export const mockedGetSessionUserId = jest.mocked(getSessionUserId);
// export const mockedGetSessionUser = jest.mocked(getSessionUser);
