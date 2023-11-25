import type { User } from "@prisma/client";
import type { ComponentProps } from "react";

export type UserIconProps = Omit<
  ComponentProps<"img">,
  "src" | "alt" | "width" | "height"
> & {
  user: Pick<User, "iconHash" | "preferredUsername">;
  size: number;
};

export function UserIcon({ user, size, ...props }: UserIconProps) {
  return (
    <img
      {...props}
      className={"hover:opacity-80 " + props.className}
      width={size}
      height={size}
      src={`/icons/${user.iconHash ?? "default"}.webp?size=${size}`}
      alt={`@${user.preferredUsername}のアイコン`}
    />
  );
}
