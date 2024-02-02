"use client";
import {
  Cog8ToothIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import type { User } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

import { Card } from "@/_shared/ui/Card";

type Props = {
  user: Pick<User, "name" | "preferredUsername">;
  iconUrl: string;
  iconAlt: string;
};

export function Dropdown({ user, iconUrl, iconAlt }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const items = [
    {
      label: "ホーム",
      href: "/",
      Icon: HomeIcon,
    },
    {
      label: `${user.name}(@${user.preferredUsername})`,
      href: `/@${user.preferredUsername}`,
      Icon: UserCircleIcon,
    },
    {
      label: "設定",
      href: "/settings",
      Icon: Cog8ToothIcon,
    },
  ];
  return (
    <div className="relative size-9" data-testid="user-menu">
      <button
        className="hover:opacity-70"
        data-testid="user-menu__button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img
          className="rounded-full"
          src={iconUrl}
          alt={iconAlt}
          width={36}
          height={36}
        />
      </button>
      {isOpen && (
        <>
          <Card
            className="absolute right-0 z-10 w-56 space-y-4 drop-shadow-xl"
            data-testid="user-menu__dropdown"
          >
            {items.map(({ label, href, Icon }) => (
              <Link
                key={label}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 hover:opacity-70"
                href={href}
              >
                <div className="flex size-5 items-center justify-center">
                  <Icon />
                </div>
                <div className="flex-1 truncate">{label}</div>
              </Link>
            ))}
          </Card>
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsOpen(false)}
            data-testid="user-menu__backdrop"
          />
        </>
      )}
    </div>
  );
}
