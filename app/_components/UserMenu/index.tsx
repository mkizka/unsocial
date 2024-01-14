import Link from "next/link";

import { userSessionService } from "@/_shared/user/services/userSessionService";
import { getIconPath } from "@/_shared/utils/icon";

import { Dropdown } from "./Dropdown";

export async function UserMenu() {
  const user = await userSessionService.getUser();
  if (user) {
    return (
      <Dropdown
        user={user}
        iconUrl={getIconPath(user.iconHash, 36)}
        iconAlt={`@${user.preferredUsername}のアイコン`}
      />
    );
  }
  return (
    <Link href="/auth" className="block">
      ログイン
    </Link>
  );
}
