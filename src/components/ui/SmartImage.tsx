"use client";
/**
 * Image wrapper: next/image optimisation + graceful branded fallback when an
 * asset is missing or a remote host is unreachable. All images require alt text.
 */
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { clsx } from "clsx";

type Props = Omit<ImageProps, "src" | "alt"> & { src?: string; alt: string; brand?: boolean };

export function SmartImage({ src, alt, className, brand = true, fill, ...rest }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={clsx(className, fill && "absolute inset-0", "overflow-hidden bg-[linear-gradient(135deg,var(--c-primary),var(--c-secondary))]", brand && "img-brand")}
        style={fill ? undefined : { aspectRatio: rest.width && rest.height ? `${rest.width}/${rest.height}` : undefined }}
      >
        <div className="h-full w-full opacity-30 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={clsx(className, brand && "img-brand")}
      onError={() => setFailed(true)}
      sizes={rest.sizes ?? (fill ? "(min-width: 1024px) 50vw, 100vw" : undefined)}
      {...rest}
    />
  );
}
