import { useContent, type PackId } from '../store/content';

const TABS: { id: PackId; label: string }[] = [
  { id: 'local', label: 'Эталон' },
  { id: 'recordings', label: 'Записи' },
];

/** «Эталон / Записи»: что показывает вторая часть — эталоны с устройства или свои записи для сравнения. */
export function PackSwitch() {
  const pack = useContent((s) => s.pack);
  const setPack = useContent((s) => s.setPack);
  const recordings = useContent((s) => s.packs.recordings.items.length);

  return (
    <div className="seg" role="tablist" aria-label="Что показывать">
      {TABS.map(({ id, label }) => (
        <button key={id} type="button" role="tab" aria-selected={pack === id} onClick={() => setPack(id)}>
          {id === 'recordings' && recordings > 0 ? `${label} ${recordings}` : label}
        </button>
      ))}
    </div>
  );
}
