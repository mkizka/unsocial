"use client";
import { signIn } from "next-auth/react";
import { useFormState } from "react-dom";

import { Button } from "@/_shared/ui/Button";
import { cn } from "@/_shared/utils/cn";
import type { FormAction } from "@/_shared/utils/formAction";

import { PasswordInputField } from "./PasswordInputField";
import { TextInputField } from "./TextInputField";

type Props = {
  type: "signUp" | "signIn";
};

const texts = {
  signUp: {
    button: "アカウントを登録",
    error: "アカウント登録に失敗しました",
  },
  signIn: {
    button: "ログイン",
    error: "ログインに失敗しました",
  },
};

const action: FormAction = async (_, form) => {
  const type = form.has("name") ? "signUp" : "signIn";
  const response = await signIn("credentials", {
    redirect: false,
    // 名前は登録時のみ送信する
    action: type,
    name: form.get("name"),
    preferredUsername: form.get("preferredUsername"),
    password: form.get("password"),
  });
  if (response?.error) {
    return { type: "error", message: response.error ?? texts[type].error };
  } else {
    location.href = "/";
    return { type: "success", message: "ログインに成功しました" };
  }
};

export function AuthForm({ type }: Props) {
  const [state, dispatch] = useFormState(action, null);

  return (
    <form className="mx-auto flex max-w-sm flex-col gap-8" action={dispatch}>
      {type === "signUp" && (
        <TextInputField
          name="name"
          label="ユーザー名"
          autoComplete="name"
          required={false}
        />
      )}
      <TextInputField
        name="preferredUsername"
        label="ユーザーID"
        autoComplete="username"
      />
      <PasswordInputField type={type} />
      <div className="flex items-center">
        {state && (
          <p
            className={cn({
              "text-destructive": state.type === "error",
              "text-primary": state.type === "success",
            })}
          >
            {state.message}
          </p>
        )}
        <Button className="ml-auto" data-testid="auth-form__button">
          {texts[type].button}
        </Button>
      </div>
    </form>
  );
}
