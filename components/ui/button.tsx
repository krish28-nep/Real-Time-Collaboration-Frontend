import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "danger";
};

const variants = {
  default: "bg-[#3525cd] text-white hover:bg-[#2d1fb2]",
  secondary: "bg-[#dce9ff] text-[#3525cd] hover:bg-[#cfe0ff]",
  ghost: "bg-transparent text-[#464555] hover:bg-[#dce9ff]/70",
  danger: "bg-[#fff0f3] text-[#cc2f4a] hover:bg-[#ffe2e8]",
};

export function Button({ className = "", variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
