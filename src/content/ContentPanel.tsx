import { ViewportInfo } from '../debug/ViewportInfo';

// Этап 1: заглушка. Карусель видео и фото появится на этапе 3.
export function ContentPanel() {
  return (
    <section className="panel panel-content" aria-label="Контент">
      <div className="placeholder">
        Контент
        <a href="/probe.html">Проверка камеры</a>
        <ViewportInfo />
      </div>
    </section>
  );
}
