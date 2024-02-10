import { Card } from "@/_shared/ui/Card";
import { env } from "@/_shared/utils/env";

export function DebugMenu() {
  const publicEnv =
    env.NODE_ENV === "production"
      ? {
          NODE_ENV: env.NODE_ENV,
          UNSOCIAL_HOST: env.UNSOCIAL_HOST,
        }
      : env;
  return (
    <Card>
      <div className="space-y-2">
        <label className="block font-bold" htmlFor="name">
          環境変数
        </label>
        <pre className="overflow-x-scroll">
          {JSON.stringify(publicEnv, null, 2)}
        </pre>
      </div>
    </Card>
  );
}
