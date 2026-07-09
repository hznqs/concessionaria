"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
}

export function VehicleThumbnail({ src, alt, fill, sizes, className, containerClassName }: Props) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={cn("flex items-center justify-center bg-ink-800 text-ink-500", containerClassName || className)}>
        <ImageOff size={16} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setError(true)}
    />
  );
}
