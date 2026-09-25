import type { CSSProperties } from 'react';
import { CameraPanel } from './camera/CameraPanel';
import { ContentPanel } from './content/ContentPanel';
import { Divider } from './layout/Divider';
import { selectMode, useUi } from './store/ui';
import './layout/layout.css';
import './layout/modes.css';

export function App() {
  const mode = useUi(selectMode);
  const overlay = useUi((s) => s.overlay);
  const hud = useUi((s) => s.hud);
  const split = useUi((s) => s.split);
  const swapped = useUi((s) => s.swapped);
  return (
    <div
      className="app"
      data-mode={mode}
      data-overlay={overlay || undefined}
      data-hud={hud ? undefined : 'off'}
      data-swapped={swapped || undefined}
      style={{ '--split': split } as CSSProperties}
    >
      <CameraPanel />
      <Divider />
      <ContentPanel />
    </div>
  );
}
