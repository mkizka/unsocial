import { getUser } from "@/app/_shared/utils/getServerSession";

jest.mock("@/app/_shared/utils/getServerSession");
export const mockedGetUser = jest.mocked(getUser);
