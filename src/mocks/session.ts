import { getUser } from "@/utils/getServerSession";

jest.mock("@/utils/getServerSession");
export const mockedGetUser = jest.mocked(getUser);
