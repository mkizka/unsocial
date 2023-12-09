import { UserList } from "@/users/[userKey]/(follows)/_components/UserList";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  return <UserList userKey={params.userKey} listBy="followers" />;
}
