import type { User } from "@prisma/client";
import type { ComponentProps } from "react";

export type UserIconProps = Omit<
  ComponentProps<"img">,
  "src" | "alt" | "width" | "height"
> & {
  user: Pick<User, "id" | "preferredUsername" | "lastFetchedAt">;
  size: number;
};

export function UserIcon({ user, size, ...props }: UserIconProps) {
  const params = new URLSearchParams();
  params.set("size", size.toString());
  const key = user.lastFetchedAt?.getTime();
  if (key) {
    params.set("key", key.toString());
  }
  return (
    <img
      {...props}
      className={"hover:opacity-80 " + props.className}
      src={`/users/${user.id}/icon.png?${params.toString()}`}
      alt={`@${user.preferredUsername}のアイコン`}
    />
  );
}
