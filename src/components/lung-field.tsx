const H12 = 12 * 3600;
const D3 = 3 * 86400;
const D21 = 21 * 86400;
const D30 = 30 * 86400;
const D90 = 90 * 86400;
const D365 = 365 * 86400;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function lungHeal(seconds: number): number {
  const s = Math.max(0, seconds);
  return clamp01(
    0.12 * (s / H12) + 0.18 * (s / D3) + 0.22 * (s / D30) + 0.24 * (s / D90) + 0.24 * (s / D365),
  );
}

export function lungHaze(seconds: number): number {
  return clamp01(1 - Math.max(0, seconds) / D21);
}

export function lungStage(seconds: number): "Haze" | "Clearing" | "Breathing" {
  if (seconds < D3) return "Haze";
  if (seconds < D90) return "Clearing";
  return "Breathing";
}

export function LungField({ seconds }: { seconds: number }) {
  const heal = lungHeal(seconds);
  const haze = lungHaze(seconds);
  const stage = lungStage(seconds);
  const sage = `rgba(143, 154, 134, ${0.12 + heal * 0.45})`;
  const smoke = `rgba(18, 17, 15, ${0.15 + haze * 0.55})`;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="lung-breathe">
        <svg viewBox="0 0 200 240" className="h-auto w-full" aria-hidden="true">
          <defs>
            <clipPath id="lung-left">
              <path d="M92 78 C88 70 72 62 58 68 C40 76 32 96 34 118 C36 142 42 168 52 188 C60 204 74 210 86 198 C94 188 96 160 96 132 C96 108 98 88 92 78 Z" />
            </clipPath>
            <clipPath id="lung-right">
              <path d="M108 78 C112 70 128 62 142 68 C160 76 168 96 166 118 C164 142 158 168 148 188 C140 204 126 210 114 198 C106 188 104 160 104 132 C104 108 102 88 108 78 Z" />
            </clipPath>
          </defs>
          <path
            d="M40 58 C70 42 130 42 160 58 C178 68 186 92 182 130 C176 186 150 214 100 226 C50 214 24 186 18 130 C14 92 22 68 40 58 Z"
            fill="var(--color-card)"
            stroke="rgba(242,240,235,0.12)"
            strokeWidth="1.5"
          />
          <path
            d="M88 36 C92 28 108 28 112 36 L116 58 C108 54 92 54 84 58 Z"
            fill="var(--color-card)"
            stroke="rgba(242,240,235,0.12)"
            strokeWidth="1.5"
          />
          <path
            d="M100 58 L100 78"
            stroke="rgba(242,240,235,0.28)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M100 78 L86 92 M100 78 L114 92"
            stroke="rgba(242,240,235,0.22)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M92 78 C88 70 72 62 58 68 C40 76 32 96 34 118 C36 142 42 168 52 188 C60 204 74 210 86 198 C94 188 96 160 96 132 C96 108 98 88 92 78 Z"
            fill={sage}
            stroke="rgba(143,154,134,0.55)"
            strokeWidth="1.4"
          />
          <path
            d="M108 78 C112 70 128 62 142 68 C160 76 168 96 166 118 C164 142 158 168 148 188 C140 204 126 210 114 198 C106 188 104 160 104 132 C104 108 102 88 108 78 Z"
            fill={sage}
            stroke="rgba(143,154,134,0.55)"
            strokeWidth="1.4"
          />
          <g clipPath="url(#lung-left)">
            <rect x="20" y="60" width="90" height="160" fill={smoke} />
          </g>
          <g clipPath="url(#lung-right)">
            <rect x="90" y="60" width="90" height="160" fill={smoke} />
          </g>
          <ellipse
            cx="100"
            cy="132"
            rx="8"
            ry="11"
            fill="rgba(196,92,74,0.35)"
            stroke="rgba(196,92,74,0.45)"
            strokeWidth="1"
          />
        </svg>
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {stage}
        <span className="mx-1.5 text-border">·</span>
        {Math.round(heal * 100)}% clearer
      </p>
    </div>
  );
}
