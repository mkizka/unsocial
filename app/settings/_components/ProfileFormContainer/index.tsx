import { getSessionUser } from "@/_shared/utils/session";

import { action } from "./action";
import { ProfileForm } from "./ProfileForm";

export async function ProfileFormContainer() {
  const user = await getSessionUser({ redirect: true });
  return <ProfileForm user={user} onSubmit={action} />;
}
