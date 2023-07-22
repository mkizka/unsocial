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
      <div className="flex mb-2 rounded overflow-x-scroll hidden-scrollbar">
        {Object.entries(tabs).map(([key, tab]) => (
          <div
            key={tab.name}
            className="bg-primary-light w-full text-sm text-center p-4 shadow"
          >
            <Link
              href={tab.href}
              className={
                (current === key ? "text-dark" : "text-gray") +
                " hover:underline"
              }
            >
              {tab.name}
            </Link>
          </div>
        ))}
      </div>
      {tab.render()}
    </>
  );
}
