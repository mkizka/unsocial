import { getSessionUserId } from "@/_shared/utils/getSessionUser";

jest.mock("@/_shared/utils/getSessionUser");
export const mockedGetSessionUserId = jest.mocked(getSessionUserId);
// export const mockedGetSessionUser = jest.mocked(getSessionUser);
