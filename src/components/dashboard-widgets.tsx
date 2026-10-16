'use client';

import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from 'react';

type Widget = { id: string; label: string; node: ReactNode; pinned?: boolean };

const storageKey = (tenantId: string) => `cevanta:overview-widgets:${tenantId}`;

export function DashboardWidgets({ tenantId, widgets }: { tenantId: string; widgets: Widget[] }) {
  const defaults = useMemo(() => widgets.map(widget => widget.id), [widgets]);
  const [order, setOrder] = useState(defaults);
  const [hidden, setHidden] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey(tenantId)) ?? '{}') as { order?: unknown; hidden?: unknown };
      const savedOrder = Array.isArray(saved.order) ? saved.order.filter((id): id is string => typeof id === 'string') : [];
      if (savedOrder.length) {
        // Hydrate the user's browser-scoped layout after the client mounts.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrder(savedOrder.filter(id => defaults.includes(id)).concat(defaults.filter(id => !savedOrder.includes(id))));
      }
      if (Array.isArray(saved.hidden)) {
        setHidden(saved.hidden.filter((id): id is string => typeof id === 'string' && defaults.includes(id)));
      }
    } catch { /* use defaults when storage is unavailable or malformed */ }
  }, [tenantId, defaults]);

  useEffect(() => {
    try { window.localStorage.setItem(storageKey(tenantId), JSON.stringify({ order, hidden })); } catch { /* layout still works for this session */ }
  }, [tenantId, order, hidden]);

  const byId = new Map(widgets.map(widget => [widget.id, widget]));
  const visible = order.map(id => byId.get(id)).filter((widget): widget is Widget => !!widget && !hidden.includes(widget.id));
  const hiddenWidgets = widgets.filter(widget => hidden.includes(widget.id));

  function move(id: string, direction: -1 | 1) {
    setOrder(current => { const index = current.indexOf(id); const next = index + direction; if (index < 0 || next < 0 || next >= current.length) return current; const copy = [...current]; [copy[index], copy[next]] = [copy[next], copy[index]]; return copy; });
  }
  function drop(event: DragEvent<HTMLDivElement>, target: string) {
    event.preventDefault();
    if (!dragged || dragged === target) return;
    setOrder(current => { const copy = [...current]; const from = copy.indexOf(dragged); const to = copy.indexOf(target); if (from < 0 || to < 0) return current; copy.splice(from, 1); copy.splice(to, 0, dragged); return copy; });
    setDragged(null);
  }
  function reset() { setOrder(defaults); setHidden([]); }

  return <>
    <div className="dashboard-layout-controls" aria-label="Overview layout controls">
      <span className="small muted">Personalize this overview for your role.</span>
      <div className="button-row">
        <button className="button secondary" type="button" onClick={() => setEditing(value => !value)}>{editing ? 'Done editing' : 'Edit layout'}</button>
        {editing && <button className="button secondary" type="button" onClick={reset}>Reset layout</button>}
      </div>
    </div>
    {editing && <div className="dashboard-widget-help" role="status">Drag cards to reorder them, use the arrows for keyboard control, or hide cards you do not need. Needs Attention stays pinned.</div>}
    <div className={`dashboard-widget-list${editing ? ' is-editing' : ''}`}>
      {visible.map((widget, index) => <div className="dashboard-widget" key={widget.id} draggable={editing && !widget.pinned} onDragStart={() => setDragged(widget.id)} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, widget.id)}>
        {editing && <div className="dashboard-widget-toolbar"><strong>{widget.label}</strong><div className="button-row"><button className="icon-button" type="button" aria-label={`Move ${widget.label} up`} onClick={() => move(widget.id, -1)} disabled={index === 0}>↑</button><button className="icon-button" type="button" aria-label={`Move ${widget.label} down`} onClick={() => move(widget.id, 1)} disabled={index === visible.length - 1}>↓</button><button className="icon-button" type="button" aria-label={`Hide ${widget.label}`} onClick={() => setHidden(current => [...current, widget.id])}>×</button></div></div>}
        {widget.node}
      </div>)}
    </div>
    {editing && hiddenWidgets.length > 0 && <div className="dashboard-hidden-widgets"><strong>Hidden cards</strong><div className="button-row">{hiddenWidgets.map(widget => <button className="button secondary" type="button" key={widget.id} onClick={() => setHidden(current => current.filter(id => id !== widget.id))}>Show {widget.label}</button>)}</div></div>}
  </>;
}
