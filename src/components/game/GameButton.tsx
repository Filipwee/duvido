"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type GameButtonVariant = "amber" | "pink" | "cyan" | "ghost";
type GameButtonSize = "lg" | "md";

const VARIANT_CLASSES: Record<GameButtonVariant, string> = {
  amber: "bg-party-amber text-purple-950",
  pink: "bg-party-pink text-white",
  cyan: "bg-party-cyan text-teal-950",
  ghost: "bg-white/10 text-white ring-2 ring-white/30 backdrop-blur",
};

const SIZE_CLASSES: Record<GameButtonSize, string> = {
  lg: "min-h-16 px-8 text-xl",
  md: "min-h-14 px-6 text-base",
};

interface GameButtonProps extends React.ComponentPropsWithRef<"button"> {
  variant?: GameButtonVariant;
  size?: GameButtonSize;
}

/** Chunky, tactile party-game button with a 3D "pop" press effect. */
export function GameButton({
  variant = "amber",
  size = "lg",
  className,
  type = "button",
  ...props
}: GameButtonProps) {
  return (
    <button
      type={type}
      className={cn("btn-pop w-full", VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    />
  );
}
