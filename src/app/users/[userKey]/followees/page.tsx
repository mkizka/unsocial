import { UserList } from "@/components/features/user/UserList";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  return <UserList userKey={params.userKey} listBy="followees" />;
}
