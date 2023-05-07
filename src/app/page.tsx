import { Home } from "@/components/Home";

export default async function HomePage() {
  // @ts-expect-error
  return <Home />;
}
