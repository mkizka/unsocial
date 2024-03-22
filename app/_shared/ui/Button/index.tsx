"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { useFormStatus } from "react-dom";

import { Spinner } from "@/_shared/ui/Spinner";
import { cn } from "@/_shared/utils/cn";

const buttonVariants = cva(
  cn(
    "relative flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      children,
      asChild = false,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const status = useFormStatus();
    const isLoading = status.pending || loading;
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {isLoading && <Spinner className="absolute h-1/2" />}
        <span
          className={cn(
            "flex justify-center items-center w-full h-full gap-1",
            {
              "opacity-0": isLoading,
            },
          )}
        >
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";
