"use client";
import { signIn } from "next-auth/react";
import type { ReactEventHandler } from "react";
import { useRef } from "react";

import { Button } from "@/_shared/ui/Button";

import { PasswordInputField } from "./PasswordInputField";
import { TextInputField } from "./TextInputField";

type Props = {
  action: "signUp" | "signIn";
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

export function AuthForm({ action }: Props) {
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit: ReactEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!ref.current) return;
    const form = new FormData(ref.current);
    const response = await signIn("credentials", {
      redirect: false,
      action,
      name: form.get("name"),
      preferredUsername: form.get("preferredUsername"),
      password: form.get("password"),
    });
    if (response?.error) {
      alert(response.error ?? texts[action].error);
    } else {
      location.href = "/";
    }
  };

  return (
    <form
      className="mx-auto flex max-w-sm flex-col gap-8"
      ref={ref}
      onSubmit={handleSubmit}
    >
      {action === "signUp" && (
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
      <PasswordInputField action={action} />
      {/* TODO:ローディングさせる */}
      <Button data-testid="auth-form__button">{texts[action].button}</Button>
    </form>
  );
}
