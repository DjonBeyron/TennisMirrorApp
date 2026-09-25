import type { CSSProperties } from 'react';
import { CameraPanel } from './camera/CameraPanel';
import { ContentPanel } from './content/ContentPanel';
import { Divider } from './layout/Divider';
import { Hud } from './layout/Hud';
import { useUi } from './store/ui';
import './layout/layout.css';

export function App() {
  const split = useUi((s) => s.split);
  const swapped = useUi((s) => s.swapped);
  return (
    <div className="app" data-swapped={swapped || undefined} style={{ '--split': split } as CSSProperties}>
      <CameraPanel />
      <Divider />
      <ContentPanel />
      <Hud />
    </div>
  );
}
