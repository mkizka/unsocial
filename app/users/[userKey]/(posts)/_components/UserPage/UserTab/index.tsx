import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/_shared/ui/Card";

type Props = {
  current: string;
  tabs: {
    [key: string]: {
      name: string;
      href: string;
      render: () => ReactNode;
    };
  };
};

export function UserTab({ tabs, current }: Props) {
  const tab = tabs[current];
  if (!tab) {
    throw new Error(`タブを表示できませんでした ${current}`);
  }
  return (
    <>
      <section className="mb-1 flex gap-1 rounded">
        {Object.entries(tabs).map(([key, tab]) => (
          <Card key={tab.name} className="w-full text-sm">
            <Link
              href={tab.href}
              className={
                (current === key ? "text-dark" : "text-gray") +
                " flex h-full w-full items-center justify-center hover:underline"
              }
            >
              {tab.name}
            </Link>
          </Card>
        ))}
      </section>
      {tab.render()}
    </>
  );
}
