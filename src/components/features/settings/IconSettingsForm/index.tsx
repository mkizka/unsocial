import { redirect } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { getUser } from "@/utils/getServerSession";

import { IconFileInput } from "./IconFileInput";

export async function IconSettingsForm() {
  const user = await getUser();
  if (!user) {
    return redirect("/auth");
  }
  return (
    <Card>
      <form className="space-y-4">
        <IconFileInput userId={user.id} />
      </form>
    </Card>
  );
}
