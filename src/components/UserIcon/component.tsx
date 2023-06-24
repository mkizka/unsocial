import type { User } from "@prisma/client";
import Image from "next/image";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Image>, "src" | "alt"> & {
  user: Pick<User, "id" | "preferredUsername" | "lastFetchedAt">;
};

export function UserIcon({ user, ...props }: Props) {
  return (
    <Image
      {...props}
      className={"hover:opacity-80 " + props.className}
      src={`/users/${user.id}/icon?${user.lastFetchedAt?.getTime() ?? ""}`}
      alt={`@${user.preferredUsername}のアイコン`}
      priority
    />
  );
}
