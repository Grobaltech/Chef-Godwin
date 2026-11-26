import { useEffect, useRef } from 'react';
import { TURNSTILE_SITE_KEY } from '../config';

let scriptPromise;
function loadScript() {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

export default function Turnstile({ onToken }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let widgetId;
    loadScript().then(() => {
      if (!ref.current || !window.turnstile) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onToken,
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken('')
      });
    });
    return () => { if (widgetId && window.turnstile) window.turnstile.remove(widgetId); };
  }, [onToken]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="mt-2" />;
}
