import { Card } from "@/components/ui/Card";

import { IconSettingsForm } from "./_components/IconSettingsForm";

export function SettingsPage() {
  return (
    <section className="space-y-1">
      <Card>
        <h1 className="font-bold">プロフィール設定</h1>
      </Card>
      <IconSettingsForm />
    </section>
  );
}
