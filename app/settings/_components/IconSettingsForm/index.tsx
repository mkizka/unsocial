import { userSessionService } from "@/_shared/user/services/userSessionService";

import { IconFileInput } from "./IconFileInput";

export async function IconSettingsForm() {
  const user = await userSessionService.getUser({ redirect: true });
  return <IconFileInput iconHash={user.iconHash} />;
}
