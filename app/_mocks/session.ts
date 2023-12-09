import { getUser } from "@/_shared/utils/getServerSession";

jest.mock("@/_shared/utils/getServerSession");
export const mockedGetUser = jest.mocked(getUser);
