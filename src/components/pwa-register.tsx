'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installation support should never block the secure dashboard.
    });
  }, []);

  return null;
}
