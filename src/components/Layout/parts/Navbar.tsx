import { Navbar as _Navbar, Text } from "@mantine/core";
import type { FC } from "react";

type Props = {
  hidden: boolean;
};

export const Navbar: FC<Props> = ({ hidden }) => {
  return (
    <_Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={hidden}
      width={{ sm: 200, lg: 300 }}
    >
      <Text>左サイドメニュー</Text>
    </_Navbar>
  );
};
