"use client";

import { useId, useState } from "react";
import { formatAmountShort } from "@/lib/format";

type Point = { label: string; value: number };

const W = 560;
const H = 150;
const PAD = { top: 16, right: 34, bottom: 22, left: 8 };

function compact(value: number): string {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)}mln`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(Math.round(value));
}

export default function RevenueArea({ data }: { data: Point[] }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);

  if (data.length < 2) {
    return (
      <p className="hint py-10 text-center">
        Grafik uchun kamida ikki oylik ma&apos;lumot kerak.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  // Yumshoq egri chiziq uchun oraliq nuqtalar
  const line = data
    .map((d, i) => {
      const px = x(i);
      const py = y(d.value);
      if (i === 0) return `M ${px} ${py}`;
      const prevX = x(i - 1);
      const cx = (prevX + px) / 2;
      return `C ${cx} ${y(data[i - 1].value)} ${cx} ${py} ${px} ${py}`;
    })
    .join(" ");

  const area = `${line} L ${x(data.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Oylik daromad dinamikasi"
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-1)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-1)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={PAD.top + innerH * t}
              y2={PAD.top + innerH * t}
              stroke="var(--viz-grid)"
              strokeWidth="1"
            />
            <text
              x={W - PAD.right + 6}
              y={PAD.top + innerH * t + 2.6}
              fontSize="7"
              fill="var(--faint)"
            >
              {compact(max * (1 - t))}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${id}-fill)`} />
        <path
          d={line}
          fill="none"
          stroke={`url(#${id}-stroke)`}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {active !== null && (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke="var(--border-strong)"
            strokeWidth="1"
          />
        )}

        {data.map((d, i) => (
          <circle
            key={d.label}
            cx={x(i)}
            cy={y(d.value)}
            r={active === i ? 5 : 0}
            fill="var(--accent-1)"
            stroke="var(--surface)"
            strokeWidth="2"
          />
        ))}

        {data.map((d, i) => (
          <rect
            key={`hit-${d.label}`}
            x={x(i) - innerW / (data.length - 1) / 2}
            y={0}
            width={innerW / (data.length - 1)}
            height={H}
            fill="transparent"
            onMouseEnter={() => setActive(i)}
          />
        ))}

        {data.map((d, i) => (
          <text
            key={`lbl-${d.label}`}
            x={x(i)}
            y={H - 5}
            textAnchor="middle"
            fontSize="8"
            fill="var(--faint)"
          >
            {d.label}
          </text>
        ))}
      </svg>

      {active !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-[var(--border)] bg-[var(--surface-3)] px-2.5 py-1.5 text-xs whitespace-nowrap"
          style={{
            left: `${(x(active) / W) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-[var(--muted)]">{data[active].label}</span>{" "}
          <strong>{formatAmountShort(data[active].value)}</strong>
        </div>
      )}
    </div>
  );
}
