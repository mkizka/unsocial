import type { User } from "@prisma/client";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"img">, "src" | "alt"> & {
  user: Pick<User, "id" | "preferredUsername" | "lastFetchedAt">;
};

export function UserIcon({ user, ...props }: Props) {
  const key = user.lastFetchedAt?.getTime();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      className={"hover:opacity-80 " + props.className}
      src={`/users/${user.id}/icon.png${key ? `?${key}` : ""}`}
      alt={`@${user.preferredUsername}のアイコン`}
    />
  );
}
