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

export function SwapIcon({ className }: { className?: string }) {
  return (
    <svg {...stroke} className={className}>
      <path d="M8 20V4M4 8l4-4 4 4M16 4v16M12 16l4 4 4-4" />
    </svg>
  );
}
