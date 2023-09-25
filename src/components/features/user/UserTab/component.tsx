import Link from "next/link";
import type { ReactNode } from "react";

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
      <section className="mb-2 flex rounded">
        {Object.entries(tabs).map(([key, tab]) => (
          <div
            key={tab.name}
            className="flex h-14 w-full bg-primary-light text-sm shadow"
          >
            <Link
              href={tab.href}
              className={
                (current === key ? "text-dark" : "text-gray") +
                " flex h-full w-full items-center justify-center hover:underline"
              }
            >
              {tab.name}
            </Link>
          </div>
        ))}
      </section>
      {tab.render()}
    </>
  );
}
