import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { cn } from "../lib/cn";

interface Hsv {
  h: number;
  s: number;
  v: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hexToHsv(hex: string): Hsv {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

function hsvToHex({ h, s, v }: Hsv) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hueColor(h: number) {
  return hsvToHex({ h, s: 1, v: 1 });
}

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export function ColorPicker({ value, onChange, className, header, footer }: ColorPickerProps) {
  const safeValue = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#7C3AED";
  const hsv = hexToHsv(safeValue);
  const [hexDraft, setHexDraft] = useState(safeValue.toUpperCase());
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const hsvRef = useRef(hsv);
  const onChangeRef = useRef(onChange);

  hsvRef.current = hsv;
  onChangeRef.current = onChange;

  useEffect(() => {
    setHexDraft(safeValue.toUpperCase());
  }, [safeValue]);

  useEffect(() => {
    function bind(
      ref: RefObject<HTMLDivElement | null>,
      handler: (event: PointerEvent, rect: DOMRect) => void
    ) {
      const node = ref.current;
      if (!node) return;
      const target = node;

      function update(event: PointerEvent) {
        const current = ref.current;
        if (!current) return;
        handler(event, current.getBoundingClientRect());
      }

      function onPointerDown(event: PointerEvent) {
        event.preventDefault();
        target.setPointerCapture(event.pointerId);
        update(event);
      }

      function onPointerMove(event: PointerEvent) {
        if (!target.hasPointerCapture(event.pointerId)) return;
        update(event);
      }

      target.addEventListener("pointerdown", onPointerDown);
      target.addEventListener("pointermove", onPointerMove);
      return () => {
        target.removeEventListener("pointerdown", onPointerDown);
        target.removeEventListener("pointermove", onPointerMove);
      };
    }

    const unbindSv = bind(svRef, (event, rect) => {
      const current = hsvRef.current;
      const s = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const v = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
      onChangeRef.current(hsvToHex({ ...current, s, v }));
    });
    const unbindHue = bind(hueRef, (event, rect) => {
      const current = hsvRef.current;
      const h = clamp(((event.clientX - rect.left) / rect.width) * 360, 0, 359.9);
      onChangeRef.current(hsvToHex({ ...current, h }));
    });

    return () => {
      unbindSv?.();
      unbindHue?.();
    };
  }, []);

  return (
    <div className={cn("rounded-2xl border border-line bg-surface p-3 shadow-lg", className)}>
      {header ? <div className="mb-3">{header}</div> : null}
      <div className="flex gap-3">
        <div
          ref={svRef}
          className="relative h-24 w-full cursor-crosshair overflow-hidden rounded-xl touch-none"
          style={{
            background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor(hsv.h)})`,
          }}
        >
          <span
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: safeValue }}
          />
        </div>
        <div className="flex w-10 shrink-0 flex-col overflow-hidden rounded-xl" style={{ background: safeValue }} />
      </div>

      <div
        ref={hueRef}
        className="relative mt-3 h-4 cursor-ew-resize rounded-full touch-none"
        style={{
          background:
            "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${(hsv.h / 360) * 100}%`, background: hueColor(hsv.h) }}
        />
      </div>

      <label className="mt-3 flex items-center gap-2">
        <span className="text-xs font-medium text-ink-soft">HEX</span>
        <input
          value={hexDraft}
          onChange={(event) => {
            const next = event.target.value.startsWith("#")
              ? event.target.value
              : `#${event.target.value}`;
            setHexDraft(next.toUpperCase());
            if (/^#[0-9A-Fa-f]{6}$/.test(next)) onChange(next.toUpperCase());
          }}
          className={cn(
            "h-9 flex-1 rounded-xl border border-line bg-surface px-3 font-mono text-sm text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          )}
          spellCheck={false}
        />
      </label>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
