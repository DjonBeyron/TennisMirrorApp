// Иконки — inline SVG, цвет берут из currentColor.
const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

type IconProps = { className?: string };

export function SwapIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" />
    </svg>
  );
}

export function ExpandIcon() {
  return (
    <svg {...stroke}>
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
    </svg>
  );
}

export function CollapseIcon() {
  return (
    <svg {...stroke}>
      <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg {...stroke}>
      <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a13 13 0 0 1-3 4.2M6.6 6.6C4.5 8 3 10 2 12c1 2.5 5 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg {...stroke}>
      <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function FlipCameraIcon() {
  return (
    <svg {...stroke}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <path d="M9.5 13.5a2.5 2.5 0 0 1 4.3-1.8M14.5 13.5a2.5 2.5 0 0 1-4.3 1.8M14 10.5v1.5h-1.5M10 16.5V15h1.5" />
    </svg>
  );
}

/** Кадр целиком (contain): прямоугольник внутри рамки. */
export function FitContainIcon() {
  return (
    <svg {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
    </svg>
  );
}

/** На всю панель (cover): стрелки к углам рамки. */
export function FitCoverIcon() {
  return (
    <svg {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 9l-2-2M16 9l2-2M8 15l-2 2M16 15l2 2" />
    </svg>
  );
}
