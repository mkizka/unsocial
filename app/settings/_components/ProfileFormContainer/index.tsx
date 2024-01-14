import { userSessionService } from "@/_shared/user/services/userSessionService";

import { action } from "./action";
import { ProfileForm } from "./ProfileForm";

export async function ProfileFormContainer() {
  const user = await userSessionService.getUser({ redirect: true });
  return <ProfileForm user={user} onSubmit={action} />;
}
