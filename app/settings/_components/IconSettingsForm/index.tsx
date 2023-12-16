import { getSessionUser } from "@/_shared/utils/getSessionUser";

import { IconFileInput } from "./IconFileInput";

export async function IconSettingsForm() {
  const user = await getSessionUser({ redirect: true });
  return <IconFileInput iconHash={user.iconHash} />;
}
