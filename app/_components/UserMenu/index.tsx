import Link from "next/link";

import { getIconPath } from "@/_shared/utils/icon";
import { getSessionUser } from "@/_shared/utils/session";

import { Dropdown } from "./Dropdown";

export async function UserMenu() {
  const user = await getSessionUser();
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
