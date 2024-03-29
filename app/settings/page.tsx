import { EnvironmentInfo } from "./_components/EnvironmentInfo";
import { IconSettingsForm } from "./_components/IconSettingsForm";
import { ProfileFormContainer } from "./_components/ProfileFormContainer";
import { RelayServer } from "./_components/RelayServer";
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
        <RelayServer />
        <EnvironmentInfo />
      </section>
      <section className="space-y-1">
        <SettingHeader>アカウント</SettingHeader>
        <SignOutForm />
      </section>
    </div>
  );
}

// なぜか静的にビルドされてしまうので指定する
export const dynamic = "force-dynamic";
