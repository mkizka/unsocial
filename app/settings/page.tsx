import { DebugMenu } from "./_components/DebugMenu";
import { IconSettingsForm } from "./_components/IconSettingsForm";
import { ProfileFormContainer } from "./_components/ProfileFormContainer";
import { SettingHeader } from "./_components/SettingHeader";
import { SignOutForm } from "./_components/SignoutForm";

export default function Page() {
  return (
    <div className="space-y-1">
      <section className="space-y-1">
        <SettingHeader>プロフィール</SettingHeader>
        <IconSettingsForm />
        <ProfileFormContainer />
      </section>
      <section className="space-y-1">
        <SettingHeader>サーバー情報</SettingHeader>
        <DebugMenu />
      </section>
      <section className="space-y-1">
        <SettingHeader>アカウント</SettingHeader>
        <SignOutForm />
      </section>
    </div>
  );
}
