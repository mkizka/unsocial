import { redirect } from "next/navigation";

import { getUser } from "@/utils/getServerSession";

import { IconFileInput } from "./IconFileInput";

export async function IconSettingsForm() {
  const user = await getUser();
  if (!user) {
    return redirect("/auth");
  }
  return <IconFileInput userId={user.id} />;
}
