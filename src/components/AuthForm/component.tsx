"use client";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { ReactEventHandler } from "react";
import { useRef, useState } from "react";

import { PasswordInputField } from "../form/PasswordInputField";
import { SubmitButton } from "../form/SubmitButton";
import { TextInputField } from "../form/TextInputField";

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
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit: ReactEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!ref.current) return;
    setLoading(true);
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
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <form
      className="flex flex-col text-dark gap-8 mx-auto max-w-sm"
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
      <SubmitButton loading={loading}>{texts[action].button}</SubmitButton>
    </form>
  );
}
