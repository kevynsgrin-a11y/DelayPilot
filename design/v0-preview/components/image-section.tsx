import Image from "next/image";
import { ReactNode } from "react";

interface ImageSectionProps {
  imageSrc: string;
  imageAlt: string;
  imagePosition?: "left" | "right";
  children: ReactNode;
  className?: string;
  imageClassName?: string;
  overlay?: boolean;
}

export function ImageSection({
  imageSrc,
  imageAlt,
  imagePosition = "right",
  children,
  className = "",
  imageClassName = "",
  overlay = false,
}: ImageSectionProps) {
  const imageOrder = imagePosition === "left" ? "lg:order-1" : "lg:order-2";
  const contentOrder = imagePosition === "left" ? "lg:order-2" : "lg:order-1";

  return (
    <div className={`grid gap-8 lg:grid-cols-2 lg:items-center ${className}`}>
      <div className={`relative ${imageOrder}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-lg">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={`object-cover ${imageClassName}`}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={false}
          />
          {overlay && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink-1000/60 via-transparent to-transparent"
            />
          )}
        </div>
      </div>
      <div className={contentOrder}>{children}</div>
    </div>
  );
}

interface ImageCardProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  className?: string;
}

export function ImageCard({
  imageSrc,
  imageAlt,
  title,
  description,
  className = "",
}: ImageCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-border-strong hover:shadow-lg ${className}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink-1000/80 via-ink-1000/20 to-transparent"
        />
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
