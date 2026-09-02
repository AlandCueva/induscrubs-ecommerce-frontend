const TURNSTILE_SITE_KEY = '0x4AAAAAAEkPOOhXP44_5-YX';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface TurnstileRenderOptions {
  sitekey: string;
  size: 'invisible';
  execution: 'execute';
  callback: (token: string) => void;
  'error-callback': () => void;
  'expired-callback': () => void;
  'timeout-callback': () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
      execute: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el verificador de seguridad.'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

// Renders a throwaway invisible Turnstile widget, executes it immediately, and
// resolves with the one-time token. Called fresh on every submit attempt since
// tokens are single-use and can expire while the customer fills out the form.
export async function getTurnstileToken(): Promise<string> {
  await loadTurnstileScript();

  if (!window.turnstile) {
    throw new Error('El verificador de seguridad no está disponible. Recarga la página.');
  }

  const turnstile = window.turnstile;

  return new Promise<string>((resolve, reject) => {
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    let settled = false;
    const cleanup = (widgetId: string) => {
      if (settled) return;
      settled = true;
      try {
        turnstile.remove(widgetId);
      } catch {
        // widget may already be gone
      }
      container.remove();
    };

    const widgetId = turnstile.render(container, {
      sitekey: TURNSTILE_SITE_KEY,
      size: 'invisible',
      execution: 'execute',
      callback: (token: string) => {
        cleanup(widgetId);
        resolve(token);
      },
      'error-callback': () => {
        cleanup(widgetId);
        reject(new Error('No se pudo verificar que eres una persona real. Inténtalo de nuevo.'));
      },
      'expired-callback': () => {
        cleanup(widgetId);
        reject(new Error('La verificación de seguridad expiró. Inténtalo de nuevo.'));
      },
      'timeout-callback': () => {
        cleanup(widgetId);
        reject(new Error('La verificación de seguridad expiró. Inténtalo de nuevo.'));
      },
    });

    turnstile.execute(widgetId);
  });
}
