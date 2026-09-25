import './ui.css';

// Версия приложения в углу экрана: по ней видно, что телефон подхватил новую сборку.
export function Version() {
  return (
    <div className="version" aria-hidden="true">
      v{__APP_VERSION__}
    </div>
  );
}
