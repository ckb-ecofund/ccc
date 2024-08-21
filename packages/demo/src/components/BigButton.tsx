import { HTMLAttributes } from "react";

export function BigButton(props: HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`border-grey-500 text-md flex h-40 w-40 flex-col items-center justify-center rounded-xl border bg-white font-bold md:h-60 md:w-60 md:text-xl ${props.className ?? ""}`}
    ></button>
  );
}
