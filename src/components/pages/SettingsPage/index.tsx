import { IconSettingsForm } from "@/components/features/settings/IconSettingsForm";
import { Card } from "@/components/ui/Card";

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
