import { Button, Navbar, Text } from "@mantine/core";
import { signOut, useSession } from "next-auth/react";
import type { FC } from "react";

type Props = {
  hidden: boolean;
};

export const LeftSidebar: FC<Props> = ({ hidden }) => {
  const { data: sessionData } = useSession();
  return (
    <Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={hidden}
      width={{ sm: 200, lg: 300 }}
    >
      <Text data-testid="is-logged-in">
        {sessionData?.user?.name}でログイン中
      </Text>
      <Button data-testid="logout-button" onClick={() => signOut()}>
        ログアウト
      </Button>
    </Navbar>
  );
};
