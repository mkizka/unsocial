import { Card } from "@/_shared/components/ui/Card";

import { IconSettingsForm } from "./_components/IconSettingsForm";

export default function Page() {
  return (
    <section className="space-y-1">
      <Card>
        <h1 className="font-bold">プロフィール設定</h1>
      </Card>
      <IconSettingsForm />
    </section>
  );
}
