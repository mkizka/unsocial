"use client";
import { Cog8ToothIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useState } from "react";

import { Card } from "@/_shared/components/ui/Card";

type Props = {
  iconUrl: string;
  iconAlt: string;
};

export function Dropdown({ iconUrl, iconAlt }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative h-9 w-9">
      <button
        className="hover:opacity-70"
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
        <Card className="absolute right-0 z-10 w-56 animate-fade drop-shadow-xl">
          <Link
            onClick={() => setIsOpen(false)}
            className="flex items-center hover:opacity-70"
            href="/settings"
          >
            <Cog8ToothIcon className="mr-2 h-5 w-5" />
            設定
          </Link>
        </Card>
      )}
    </div>
  );
}
