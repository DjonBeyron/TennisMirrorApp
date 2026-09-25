import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './ui.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Подпись для экранного диктора и всплывающей подсказки. */
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className, ...rest }: Props) {
  return (
    <button
      type="button"
      className={className ? `icon-btn ${className}` : 'icon-btn'}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  );
}
