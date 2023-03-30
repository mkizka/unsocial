import { useSession } from "next-auth/react";
import type { FC } from "react";

import { GuestHome } from "./GuestHome";
import { UserHome } from "./UserHome";

export const Home: FC = () => {
  const { data: sessionData } = useSession();

  if (sessionData?.user) return <UserHome user={sessionData.user} />;
  return <GuestHome />;
};
