import logo from "@/assets/aifa-logo.png";
import { cn } from "@/lib/utils";

export function BrandLogo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <img
      src={logo}
      alt="AIFA Hotel emblem"
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
