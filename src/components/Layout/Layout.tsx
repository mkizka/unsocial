import { AppShell } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import type { FC, ReactNode } from "react";

import { Aside } from "./parts/Aside";
import { Header } from "./parts/Header";
import { Navbar } from "./parts/Navbar";

type Props = {
  children: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const [opened, toggle] = useToggle();
  return (
    <AppShell
      padding="0rem"
      navbar={<Navbar hidden={!opened} />}
      aside={<Aside />}
      header={<Header opened={opened} onClick={toggle} />}
    >
      {children}
    </AppShell>
  );
};
