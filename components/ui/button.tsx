import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-white text-black hover:bg-white/90",
  glass: "glass hover:bg-white/10",
  outline: "border border-white/15 hover:bg-white/5",
  ghost: "hover:bg-white/5 text-muted hover:text-foreground",
  destructive: "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20",
  success: "bg-emerald-400 text-black hover:bg-emerald-300",
};
const sizes = { sm: "h-9 px-3.5 text-xs", md: "h-10 px-5 text-sm", icon: "h-9 w-9" };

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: keyof typeof sizes }) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer rounded-xl items-center justify-center gap-2 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
