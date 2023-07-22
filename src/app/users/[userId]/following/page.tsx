import { UserPage } from "@/components/pages/UserPage";

export default async function Page({ params }: { params: { userId: string } }) {
  return <UserPage userId={params.userId} currentTab="following" />;
}
