import {
  getSessionUser,
  getSessionUserId,
  getSessionUserIdOrNull,
  getSessionUserOrNull,
} from "@/_shared/utils/getSessionUser";

jest.mock("@/_shared/utils/getSessionUser");
export const mockedGetSessionUserId = jest.mocked(getSessionUserId);
export const mockedGetSessionUserIdOrNull = jest.mocked(getSessionUserIdOrNull);
export const mockedGetSessionUser = jest.mocked(getSessionUser);
export const mockedGetSessionUserOrNull = jest.mocked(getSessionUserOrNull);
