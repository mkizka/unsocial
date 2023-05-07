import type { FC } from "react";

import { SignInOrOutButton } from "./parts/LoginButton";

export const GuestHome: FC = () => {
  return (
    <main>
      <SignInOrOutButton />
    </main>
  );
};
