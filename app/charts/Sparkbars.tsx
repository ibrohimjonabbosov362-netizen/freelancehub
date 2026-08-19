"use client";

import { useId, useState } from "react";

type Props = {
  values: number[];
  labels: string[];
  color: string;
  ariaLabel: string;
};

export default function Sparkbars({ values, labels, color, ariaLabel }: Props) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(...values, 1);
  const pitch = 100 / values.length;
  const barW = pitch * 0.4;

  return (
    <div className="relative">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        role="img"
        aria-label={ariaLabel}
        className="h-10 w-full overflow-visible"
      >
        {values.map((value, i) => {
          const h = Math.max((value / max) * 32, 1.5);
          const x = i * pitch + (pitch - barW) / 2;
          const active = hover === i;

          return (
            <rect
              key={`${id}-${i}`}
              x={x}
              y={38 - h}
              width={barW}
              height={h}
              rx={0.8}
              fill={color}
              opacity={value === 0 ? 0.3 : hover === null || active ? 1 : 0.4}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {hover !== null && (
        <div className="pointer-events-none absolute -top-7 left-0 rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-2 py-1 text-xs whitespace-nowrap">
          {labels[hover]}: <strong>{values[hover]}</strong>
        </div>
      )}
    </div>
  );
}
