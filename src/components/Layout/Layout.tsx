import { AppShell } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import type { FC, ReactNode } from "react";

import { Header } from "./parts/Header";
import { LeftSidebar } from "./parts/LeftSidebar";
import { RightSidebar } from "./parts/RightSidebar";

type Props = {
  children: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const [opened, toggle] = useToggle();
  return (
    <AppShell
      padding="0rem"
      navbar={<LeftSidebar hidden={!opened} />}
      aside={<RightSidebar />}
      header={<Header opened={opened} onClick={toggle} />}
    >
      {children}
    </AppShell>
  );
};
