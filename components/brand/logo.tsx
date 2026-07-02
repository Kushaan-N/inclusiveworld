import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  width = 190,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      src="/inclusive-world-logo.png"
      alt="Inclusive World — Where Abilities Lead the Way"
      width={width}
      height={Math.round(width * 0.32)}
      priority
      className={className}
      style={{ width: `${width}px`, height: "auto" }}
    />
  );
}
