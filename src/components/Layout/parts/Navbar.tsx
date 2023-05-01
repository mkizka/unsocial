import { Button, Navbar as _Navbar, Text } from "@mantine/core";
import { signOut, useSession } from "next-auth/react";
import type { FC } from "react";

type Props = {
  hidden: boolean;
};

export const Navbar: FC<Props> = ({ hidden }) => {
  const { data: sessionData } = useSession();
  return (
    <_Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={hidden}
      width={{ sm: 200, lg: 300 }}
    >
      <Text>{sessionData?.user?.name}でログイン中</Text>
      <Button data-testid="logout-button" onClick={() => signOut()}>
        ログアウト
      </Button>
    </_Navbar>
  );
};
