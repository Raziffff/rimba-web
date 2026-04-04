"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className, size = 44 }: LogoProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl bg-green-700 font-bold text-white shadow-lg shadow-green-700/20",
        className
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {!imageError && (
        <Image
          src="/logo-rimba.png.png"
          alt="Logo RIMBA"
          width={size}
          height={size}
          className="relative z-10 h-full w-full bg-white object-contain"
          priority
          onError={() => setImageError(true)}
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center text-lg">
        R
      </span>
    </div>
  );
}
