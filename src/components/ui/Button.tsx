import { type ButtonHTMLAttributes } from "react";
import { classNames } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost: "text-gray-600 hover:bg-gray-100 focus:ring-indigo-500",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
