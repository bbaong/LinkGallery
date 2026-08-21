import type { CSSProperties } from "react";
import { assetUrl } from "../../../shared/lib/assetUrl";
import { cn } from "../../../shared/lib/cn";
import { gradientBackground, isHexColor } from "../lib/coverValue";
import { DEFAULT_SOLID_COLOR } from "../constants/coverColors";
import type { CoverType } from "../types";

interface FolderCoverProps {
  coverType: CoverType;
  coverValue: string;
  className?: string;
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function mixHex(hex: string, target: string, amount: number) {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  return `#${[mix(from.r, to.r), mix(from.g, to.g), mix(from.b, to.b)]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function GlassCover({ color }: { color: string }) {
  const highlight = mixHex(color, "#ffffff", 0.45);
  const shadow = mixHex(color, "#0f0d16", 0.35);
  const rgb = hexToRgb(color);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${highlight} 0%, ${color} 48%, ${shadow} 100%)`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(125deg, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.18) 28%, rgba(255,255,255,0.04) 52%, transparent 70%)",
        }}
      />
      <div
        className="absolute -left-1/4 -top-1/3 h-2/3 w-2/3 rounded-full blur-2xl"
        style={{ background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)` }}
      />
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
        }}
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
}

export function FolderCover({ coverType, coverValue, className }: FolderCoverProps) {
  if (coverType === "IMAGE") {
    const style: CSSProperties = {
      backgroundImage: `url(${assetUrl(coverValue)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
    return <div className={cn("h-full w-full", className)} style={style} />;
  }

  if (coverType === "GLASS") {
    const color = isHexColor(coverValue) ? coverValue : DEFAULT_SOLID_COLOR;
    return (
      <div className={cn("h-full w-full", className)}>
        <GlassCover color={color} />
      </div>
    );
  }

  if (coverType === "SOLID") {
    const color = isHexColor(coverValue) ? coverValue : DEFAULT_SOLID_COLOR;
    return <div className={cn("h-full w-full", className)} style={{ backgroundColor: color }} />;
  }

  return (
    <div
      className={cn("h-full w-full", className)}
      style={{ backgroundImage: gradientBackground(coverValue) }}
    />
  );
}
