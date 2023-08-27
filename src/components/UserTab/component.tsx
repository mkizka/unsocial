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
      <div className="hidden-scrollbar mb-2 flex overflow-x-scroll rounded">
        {Object.entries(tabs).map(([key, tab]) => (
          <div
            key={tab.name}
            className="w-full bg-primary-light p-4 text-center text-sm shadow"
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
