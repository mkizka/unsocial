import { getServerSession } from "@/utils/getServerSession";

import { GuestHome } from "./GuestHome";
import { UserHome } from "./UserHome";

export async function Home() {
  const session = await getServerSession();

  if (session?.user) {
    // @ts-expect-error
    return <UserHome user={session.user} />;
  }
  return <GuestHome />;
}
