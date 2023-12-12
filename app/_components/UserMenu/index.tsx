import Link from "next/link";

import { getUser } from "@/_shared/utils/getServerSession";
import { getIconPath } from "@/_shared/utils/icon";
import { prisma } from "@/_shared/utils/prisma";

import { Dropdown } from "./Dropdown";

export async function UserMenu() {
  const user = await getUser();
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });
    return (
      <Dropdown
        iconUrl={getIconPath(dbUser?.iconHash, 64)}
        iconAlt={`@${dbUser?.preferredUsername}のアイコン`}
      />
    );
  }
  return (
    <Link href="/auth" className="block">
      ログイン
    </Link>
  );
}
