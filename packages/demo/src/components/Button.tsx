import { ReactNode } from "react";

export function Button(
  props: {
    icon?: ReactNode;
    variant?: "primary" | "success";
    as?: "button" | "a";
  } & React.ComponentPropsWithoutRef<"button"> &
    React.ComponentPropsWithoutRef<"a">,
) {
  const classes = {
    primary: "border-neutral-400 bg-neutral-800 text-white",
    success: "border-green-300 bg-green-100 text-emerald-600",
  }[props.variant ?? "primary"];

  const Tag = props.as ?? "button";

  return (
    <Tag
      {...props}
      className={`flex items-center justify-center rounded-full px-4 py-2 font-bold no-underline disabled:opacity-70 ${classes} ${props.className}`}
      style={{
        borderWidth: "3px",
        ...(props.style ?? {}),
      }}
    >
      {props.icon ? <div className="mr-2">{props.icon}</div> : undefined}
      {props.children}
    </Tag>
  );
}
