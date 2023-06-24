import type { ComponentProps } from "react";

export function Button(props: ComponentProps<"button">) {
  return (
    <button
      className="block w-full text-center rounded px-3 py-1.5 shadow
  text-light bg-secondary hover:bg-secondary-dark"
      {...props}
    >
      {props.children}
    </button>
  );
}
