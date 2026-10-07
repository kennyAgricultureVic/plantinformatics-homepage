import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ink } from "./print";

/**
 * A screenshot run through the press: the greyscale image becomes one ink (darks print, lights stay
 * paper), and a halftone screen of a second ink lands on top, out of register.
 */
export function Duotone({ src, alt, slots = [2, 0], className }: { src: string; alt: string; slots?: readonly [number, number]; className?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <div className="riso-ink relative isolate">
        <Image src={src} alt={alt} width={1421} height={876} className="block w-full contrast-125 grayscale dark:invert" />
        <span aria-hidden className="absolute inset-0 mix-blend-screen dark:mix-blend-multiply" style={{ background: ink(slots[0]) }} />
      </div>
      <span
        aria-hidden
        className="riso-ink riso-dots riso-shift absolute inset-0 opacity-80 [mask-image:linear-gradient(150deg,black,transparent_55%)]"
        style={{ "--riso-dot": ink(slots[1]) } as CSSProperties}
      />
    </div>
  );
}
