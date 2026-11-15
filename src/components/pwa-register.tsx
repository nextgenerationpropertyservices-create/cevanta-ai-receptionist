'use client';

import { useEffect, useRef, useState } from 'react';

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export function PwaRegister() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [canInstall, setCanInstall] = useState(false);
  const pending = useRef<InstallPrompt | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)');
    const sync = () => setVisible(window.isSecureContext && 'serviceWorker' in navigator && !display.matches && !(navigator as Navigator & { standalone?: boolean }).standalone);
    const capture = (event: Event) => { event.preventDefault(); pending.current = event as InstallPrompt; setCanInstall(true); sync(); };
    const installed = () => { pending.current = null; setVisible(false); dialog.current?.close(); };
    const frame = requestAnimationFrame(sync);
    display.addEventListener('change', sync);
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', installed);
    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Manual installation instructions remain available.
      });
    }
    return () => {
      cancelAnimationFrame(frame);
      display.removeEventListener('change', sync);
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  async function install() {
    const event = pending.current;
    if (!event) { setMessage('Use the instructions below to install from your browser menu.'); return; }
    pending.current = null;
    setCanInstall(false);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === 'accepted') { setVisible(false); dialog.current?.close(); }
      else setMessage('Installation cancelled. You can still install from your browser menu.');
    } catch { setMessage('Please use the browser menu instructions below.'); }
  }

  return visible ? <>
    <button type="button" onClick={() => dialog.current?.showModal()} style={{position:'fixed',bottom:18,left:18,zIndex:70,padding:'10px 16px',borderRadius:12,border:'1px solid #087786',background:'#00cce6',color:'#06272d',fontWeight:700,cursor:'pointer'}}>Install Cevanta</button>
    <dialog ref={dialog} aria-labelledby="install-title" style={{maxWidth:460,width:'calc(100% - 32px)',maxHeight:'85vh',overflowY:'auto',padding:26,border:'1px solid #b8d0d2',borderRadius:18,background:'#f5f7f3',color:'#143a38'}}>
      <h2 id="install-title" style={{color:'#143a38'}}>Keep Cevanta one tap away</h2>
      <p style={{color:'#405e5a'}}>Add Cevanta to your phone or computer. Use your existing account and workspace.</p>
      {canInstall && <button className="button" type="button" onClick={install}>Install now</button>}
      <p role="status" style={{color:'#405e5a'}}>{message}</p>
      <ul style={{paddingLeft:20}}>
        <li>iPhone or iPad: Open in Safari, tap Share, then Add to Home Screen and Add.</li>
        <li>Android: Open the browser menu and choose Install app or Add to Home screen.</li>
        <li>Computer: In Chrome or Edge, use the install icon in the address bar or the browser menu’s install option.</li>
      </ul>
      <p style={{color:'#405e5a'}}>An internet connection is required for business records. Installation is free and does not activate paid services.</p>
      <button className="button" type="button" onClick={() => dialog.current?.close()}>Close</button>
    </dialog>
  </> : null;
}
