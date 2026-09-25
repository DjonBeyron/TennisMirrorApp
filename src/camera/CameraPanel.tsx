// Этап 1: заглушка. Превью камеры, зум и запись появятся на этапе 2.
export function CameraPanel() {
  return (
    <section className="panel panel-camera" aria-label="Камера">
      <div className="placeholder">Камера</div>
    </section>
  );
}
