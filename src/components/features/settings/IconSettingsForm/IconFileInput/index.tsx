"use client";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Card } from "@/components/ui/Card";

type Props = {
  userId?: string;
};

export function IconFileInput({ userId }: Props) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  return (
    <Card>
      <form className="space-y-1">
        <label className="block text-xl" htmlFor="icon">
          アイコン
        </label>
        <input
          id="icon"
          type="file"
          accept="image/*"
          onChange={(e) => {
            setUploadedImage(e.target.files?.[0] ?? null);
          }}
        />
        <div className="flex">
          <div className="flex flex-col items-center space-y-1">
            <p>現在のアイコン</p>
            <img
              width={100}
              height={100}
              className="aspect-square object-cover"
              src={`/users/${userId}/icon.webp?size=100`}
              alt=""
            ></img>
          </div>
          <div className="pt-16">
            <ArrowRightIcon className="mx-4 h-6 w-6" />
          </div>
          <div className="flex flex-col items-center space-y-1">
            <p>新しいアイコン</p>
            {uploadedImage ? (
              <img
                width={100}
                height={100}
                className="aspect-square object-cover"
                src={URL.createObjectURL(uploadedImage)}
                alt=""
              ></img>
            ) : (
              <div className="aspect-square w-[100px] bg-gray"></div>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
