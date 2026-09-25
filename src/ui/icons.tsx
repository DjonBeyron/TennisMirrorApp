// Иконки — inline SVG, цвет берут из currentColor.
const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
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

/** Фотоаппарат со стрелкой поворота сверху: крупные детали, читается и в кнопке 44 px. */
export function FlipCameraIcon() {
  return (
    <svg {...stroke}>
      <path d="M3 10a2 2 0 0 1 2-2h2l1.5-2h7L17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="14" r="3" />
      <path d="M7 4.5a7 7 0 0 1 10 0M17 4.5V2M17 4.5h-2.5" />
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

export function PlayIcon() {
  return (
    <svg {...stroke}>
      <path d="M7 4.5v15L19.5 12z" fill="currentColor" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg {...stroke}>
      <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" />
    </svg>
  );
}

/** Кадр назад: черта и треугольник влево. */
export function StepBackIcon() {
  return (
    <svg {...stroke}>
      <path d="M6 5v14" />
      <path d="M18 5.5v13L9 12z" fill="currentColor" />
    </svg>
  );
}

/** Кадр вперёд: треугольник вправо и черта. */
export function StepForwardIcon() {
  return (
    <svg {...stroke}>
      <path d="M18 5v14" />
      <path d="M6 5.5v13L15 12z" fill="currentColor" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg {...stroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Зеркало: ось посередине и два треугольника — контур и его отражение. */
export function MirrorIcon() {
  return (
    <svg {...stroke}>
      <path d="M12 3v18" strokeDasharray="2 3" />
      <path d="M9 7L3 17h6z" />
      <path d="M15 7l6 10h-6z" fill="currentColor" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...stroke}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

/** Две камеры: экран, разделённый пополам, в каждой половине объектив. */
export function DualIcon() {
  return (
    <svg {...stroke}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M12 5v14" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="17" cy="12" r="2" />
    </svg>
  );
}

/** Наложение: два слоя, верхний полупрозрачный. */
export function LayersIcon() {
  return (
    <svg {...stroke}>
      <rect x="3" y="3" width="13" height="13" rx="2" />
      <rect x="8" y="8" width="13" height="13" rx="2" fill="currentColor" fillOpacity={0.35} />
    </svg>
  );
}

/** Прозрачность: наполовину закрашенный круг. */
export function OpacityIcon() {
  return (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg {...stroke}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon() {
  return (
    <svg {...stroke}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

/** Поделиться: стрелка вверх из коробки (как в iOS). */
export function ShareIcon() {
  return (
    <svg {...stroke}>
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5v10h14V11h-1" />
    </svg>
  );
}
