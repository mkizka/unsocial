import { mockDeep } from "jest-mock-extended";

import { createLogger } from "@/app/_shared/utils/logger";

const mockedLogger = mockDeep<ReturnType<typeof createLogger>>();

jest.mock("@/app/_shared/utils/logger");
const mockedCreateLogger = jest.mocked(createLogger);
mockedCreateLogger.mockReturnValue(mockedLogger);

export { mockedLogger };
