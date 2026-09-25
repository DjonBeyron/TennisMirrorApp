/// <reference types="vite-plugin-pwa/client" />

// Подставляются при сборке (vite.config.ts → define).
declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;

// Зум камеры (Media Capture Extensions) — в lib.dom его нет в возможностях и ограничениях трека.
interface MediaTrackCapabilities {
  zoom?: { min: number; max: number; step?: number };
}

interface MediaTrackConstraintSet {
  zoom?: ConstrainDouble | boolean;
}
