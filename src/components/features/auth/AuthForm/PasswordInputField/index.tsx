import { TextInput } from "@/components/features/auth/AuthForm/TextInput";

type Props = {
  action: "signUp" | "signIn";
};

export function PasswordInputField({ action }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label htmlFor="password">パスワード(8文字以上)</label>
        {action === "signIn" && (
          <a href="#" className="block text-secondary hover:underline">
            パスワードを忘れた場合
          </a>
        )}
      </div>
      <TextInput
        id="password"
        name="password"
        type="password"
        data-testid="password-input"
        autoComplete={action === "signUp" ? "new-password" : "current-password"}
        required
      />
    </div>
  );
}
