import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  title?: string;
};

const officialLogoUrl = "/manus-storage/network-of-deeds-logo_e7482ae3.jpeg";

/** The official Network of Deeds by Kids logo, served from managed project storage. */
export function BrandMark({
  className,
  title = "Network of Deeds by Kids",
}: BrandMarkProps) {
  return (
    <img
      src={officialLogoUrl}
      alt={title}
      className={cn("shrink-0 object-contain", className)}
      decoding="async"
    />
  );
}
