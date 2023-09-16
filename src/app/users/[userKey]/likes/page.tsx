import { UserPage } from "@/components/pages/UserPage";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  return <UserPage userKey={params.userKey} currentTab="likes" />;
}
