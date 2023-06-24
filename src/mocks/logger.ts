import { mockDeep } from "jest-mock-extended";

import { createLogger } from "@/utils/logger";

const mockedLogger = mockDeep<ReturnType<typeof createLogger>>();

jest.mock("@/utils/logger");
const mockedCreateLogger = jest.mocked(createLogger);
mockedCreateLogger.mockReturnValue(mockedLogger);

export { mockedLogger };
