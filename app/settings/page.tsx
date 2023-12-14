import { Card } from "@/_shared/components/ui/Card";

import { IconSettingsForm } from "./_components/IconSettingsForm";
import { ProfileFormContainer } from "./_components/ProfileFormContainer";
import { SignOutForm } from "./_components/SignoutForm";

export default function Page() {
  return (
    <div className="space-y-1">
      <section className="space-y-1">
        <Card>
          <h1 className="font-bold">プロフィール</h1>
        </Card>
        <IconSettingsForm />
        <ProfileFormContainer />
      </section>
      <section className="space-y-1">
        <Card>
          <h1 className="font-bold">アカウント</h1>
        </Card>
        <SignOutForm />
      </section>
    </div>
  );
}
