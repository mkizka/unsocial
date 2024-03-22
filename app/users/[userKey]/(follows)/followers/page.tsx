import { FollowList } from "@/users/[userKey]/(follows)/_components/FollowList";

export default async function Page({
  params,
}: {
  params: { userKey: string };
}) {
  return <FollowList userKey={params.userKey} listBy="followers" />;
}
