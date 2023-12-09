import { UserPage } from "@/users/[userKey]/(posts)/_components/UserPage";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  return <UserPage userKey={params.userKey} currentTab="likes" />;
}
