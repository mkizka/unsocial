import { TextInput } from "../TextInput";

type Props = {
  type: "signUp" | "signIn";
};

export function PasswordInputField({ type }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label htmlFor="password">パスワード(8文字以上)</label>
        {type == "signIn" && (
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
        autoComplete={type == "signUp" ? "new-password" : "current-password"}
        required
      />
    </div>
  );
}
