import { UserPage } from "./_components/UserPage";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  return <UserPage userKey={params.userKey} currentTab="root" />;
}
