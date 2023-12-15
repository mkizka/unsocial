import { getUser } from "@/_shared/utils/getServerSession";
import {
  getSessionUser,
  getSessionUserId,
} from "@/_shared/utils/getSessionUser";

jest.mock("@/_shared/utils/getServerSession");
export const mockedGetUser = jest.mocked(getUser);

export const mockedGetSessionUserId = jest.mocked(getSessionUserId);
export const mockedGetSessionUser = jest.mocked(getSessionUser);
