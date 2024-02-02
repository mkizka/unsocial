import { userSessionService } from "@/_shared/user/services/userSessionService";
const handler = userSessionService.handler;
export { handler as GET, handler as POST };
