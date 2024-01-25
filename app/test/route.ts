import { createLogger } from "@/_shared/utils/logger";

const logger = createLogger("test");

export const GET = () => {
  logger.info("info");
  logger.warn("warn");
  logger.error("error");
  return Response.json({ message: "Hello world" });
};
