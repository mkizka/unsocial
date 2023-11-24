"use server";
import fs from "fs";
import { setTimeout } from "timers/promises";

export const action = async (formData: FormData) => {
  await setTimeout(3000);
  console.log(fs.readdirSync(__dirname).length);
  return {
    foo: "bar",
  };
};
