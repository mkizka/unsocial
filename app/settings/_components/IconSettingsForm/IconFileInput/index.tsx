"use client";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRef, useState } from "react";
import { useFormState } from "react-dom";

import { Button } from "@/_shared/ui/Button";
import { Card } from "@/_shared/ui/Card";
import { Input } from "@/_shared/ui/Input";
import { cn } from "@/_shared/utils/cn";
import { getIconPath } from "@/_shared/utils/icon";

import { action } from "./action";

type Props = {
  iconHash: string | null;
};

export function IconFileInput({ iconHash }: Props) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [state, dispatch] = useFormState(action, null);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Card>
      <form
        className="space-y-2"
        action={async (formData) => {
          if (!uploadedImage) {
            alert("アイコンを選択してください");
            return;
          }
          dispatch(formData);
          ref.current && (ref.current.value = "");
          setUploadedImage(null);
        }}
      >
        <label className="block font-bold" htmlFor="icon">
          アイコン
        </label>
        <Input
          id="icon"
          name="icon"
          type="file"
          accept="image/*"
          ref={ref}
          onChange={(e) => {
            setUploadedImage(e.target.files?.[0] ?? null);
          }}
        />
        <div className="flex">
          <div className="flex flex-col items-center space-y-1">
            <p className="text-sm">現在のアイコン</p>
            <img
              width={100}
              height={100}
              className="aspect-square object-cover"
              src={getIconPath(iconHash, 100)}
              alt=""
            ></img>
          </div>
          <div className="pt-16">
            <ArrowRightIcon className="mx-4 size-6" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <p className="text-sm">新しいアイコン</p>
            {uploadedImage ? (
              <img
                width={100}
                height={100}
                className="aspect-square object-cover"
                src={URL.createObjectURL(uploadedImage)}
                alt=""
              ></img>
            ) : (
              <div className="aspect-square w-[100px]"></div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          {state && (
            <p
              className={cn({
                "text-accent": state.type === "error",
                "text-secondary": state.type === "success",
              })}
            >
              {state.message}
            </p>
          )}
          <Button className="ml-auto">変更する</Button>
        </div>
      </form>
    </Card>
  );
}
