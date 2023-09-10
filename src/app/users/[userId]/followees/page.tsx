import { UserList } from "@/components/features/user/UserList";

export default async function Page({ params }: { params: { userId: string } }) {
  return <UserList userId={params.userId} listBy="followees" />;
}
