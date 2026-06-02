// ETG Dashboard — single-worker calendar drill-down (hand-built, no library).
// Additive to the technician×day overview. Plain React + pointer events.
const { useState: useWC, useRef: useWCRef, useEffect: useWCEffect } = React;

const PX_PER_HOUR = 56;
const DAY_START = 6;   // 6:00 AM
const DAY_END = 20;    // 8:00 PM
const SNAP = 15;       // minutes
const MIN_DUR = 30;    // minutes
const WC_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WC_DATES = ['12', '13', '14', '15', '16', '17', '18'];

function wcParse(s) { // "8:00 AM" -> minutes
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(s || ''); if (!m) return null;
  let h = parseInt(m[1], 10) % 12; if (/PM/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}
function wcRange(time) { const p = (time || '').split('–'); const a = wcParse(p[0]); const b = wcParse(p[1]); return (a == null || b == null) ? [480, 720] : [a, b]; }
function wcFmt(mins) {
  mins = Math.max(0, Math.min(24 * 60, mins)); let h = Math.floor(mins / 60); const mm = mins % 60;
  const ap = h >= 12 ? 'PM' : 'AM'; let hh = h % 12; if (hh === 0) hh = 12;
  return `${hh}:${String(mm).padStart(2, '0')} ${ap}`;
}
const wcSnap = (m) => Math.round(m / SNAP) * SNAP;

function WorkerCalendar({ techIndex, onBack, onOpenVisit }) {
  const tech = TECHS[techIndex];
  const [view, setView] = useWC('week');
  const [dayIdx, setDayIdx] = useWC(2); // Wed (today)
  const [selId, setSelId] = useWC(null);
  const [visits, setVisits] = useWC(() => (CAL_JOBS[techIndex] || []).map((j, i) => {
    const [s, e] = wcRange(j.time); return { ...j, _id: techIndex + '-' + i, startMin: s, endMin: e };
  }));
  const gridRef = useWCRef(null);
  const drag = useWCRef(null);

  function commitTime(v) {
    return { ...v, time: wcFmt(v.startMin) + ' – ' + wcFmt(v.endMin) };
  }

  function onPointerDown(e, v, mode) {
    e.preventDefault(); e.stopPropagation();
    const colW = gridRef.current ? (gridRef.current.getBoundingClientRect().width / (view === 'week' ? 7 : 1)) : 200;
    drag.current = { id: v._id, mode, startY: e.clientY, startX: e.clientX, origStart: v.startMin, origEnd: v.endMin, origDay: v.day, colW, moved: false };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }
  function onPointerMove(e) {
    const d = drag.current; if (!d) return;
    const dMin = wcSnap((e.clientY - d.startY) / PX_PER_HOUR * 60);
    if (Math.abs(e.clientY - d.startY) > 3 || Math.abs(e.clientX - d.startX) > 3) d.moved = true;
    setVisits((vs) => vs.map((v) => {
      if (v._id !== d.id) return v;
      let { origStart: s, origEnd: en } = d;
      if (d.mode === 'move') {
        let dur = en - s; let ns = s + dMin;
        ns = Math.max(DAY_START * 60, Math.min(DAY_END * 60 - dur, ns));
        let nv = { ...v, startMin: ns, endMin: ns + dur };
        if (view === 'week') { const dCol = Math.round((e.clientX - d.startX) / d.colW); nv.day = Math.max(0, Math.min(6, d.origDay + dCol)); }
        return nv;
      }
      if (d.mode === 'top') { let ns = Math.max(DAY_START * 60, Math.min(en - MIN_DUR, s + dMin)); return { ...v, startMin: ns }; }
      if (d.mode === 'bottom') { let ne = Math.min(DAY_END * 60, Math.max(s + MIN_DUR, en + dMin)); return { ...v, endMin: ne }; }
      return v;
    }));
  }
  function onPointerUp() {
    const d = drag.current;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    if (d) { setVisits((vs) => vs.map((v) => v._id === d.id ? commitTime(v) : v)); if (!d.moved) setSelId(d.id); }
    drag.current = null;
  }

  const hours = []; for (let h = DAY_START; h <= DAY_END; h++) hours.push(h);
  const bodyH = (DAY_END - DAY_START) * PX_PER_HOUR;
  const cols = view === 'week' ? [0, 1, 2, 3, 4, 5, 6] : [dayIdx];
  const selVisit = visits.find((v) => v._id === selId);
  const rangeLabel = view === 'week' ? '12 – 18 May 2026' : `${WC_DAYS[dayIdx]} ${WC_DATES[dayIdx]} May 2026`;

  return (
    <div>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid hsl(var(--input))', background: 'hsl(var(--card))', borderRadius: 8, padding: '8px 12px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'hsl(var(--foreground))' }}>
          <Icon name="arrow-left" size={15} />Back to all technicians</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={tech.name} size={38} />
          <div><div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{tech.name}</div>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Personal calendar</div></div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: 'hsl(var(--muted))', borderRadius: 8, padding: 3, gap: 2 }}>
            {['Day', 'Week'].map((t) => { const on = view === t.toLowerCase();
              return <button key={t} onClick={() => setView(t.toLowerCase())} style={{ border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                background: on ? 'hsl(var(--card))' : 'transparent', color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', boxShadow: on ? 'var(--shadow-sm)' : 'none' }}>{t}</button>; })}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid hsl(var(--input))', borderRadius: 8, overflow: 'hidden' }}>
            <button onClick={() => view === 'day' && setDayIdx((d) => Math.max(0, d - 1))} style={wcArrow}><Icon name="chevron-left" size={16} /></button>
            <span style={{ padding: '0 12px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{rangeLabel}</span>
            <button onClick={() => view === 'day' && setDayIdx((d) => Math.min(6, d + 1))} style={wcArrow}><Icon name="chevron-right" size={16} /></button>
          </div>
          <Button variant="outline" onClick={() => setDayIdx(2)}>Today</Button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 12 }}>
        <Icon name="move" size={13} color="hsl(var(--primary))" />Drag a visit to reschedule · drag its edges to change the time
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {/* day headers (week) */}
          {view === 'week' && <div style={{ display: 'grid', gridTemplateColumns: `56px repeat(7, 1fr)`, borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)' }}>
            <div></div>
            {cols.map((di) => { const today = di === 2;
              return <div key={di} style={{ padding: '8px 6px', textAlign: 'center', borderLeft: '1px solid hsl(var(--border))', fontSize: 12 }}>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>{WC_DAYS[di]} </span>
                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...(today ? { background: 'hsl(var(--primary))', color: '#fff', borderRadius: '50%', width: 20, height: 20 } : {}) }}>{WC_DATES[di]}</span>
              </div>; })}
          </div>}

          {/* time grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `56px 1fr`, maxHeight: 560, overflowY: 'auto' }}>
            {/* hours axis */}
            <div style={{ position: 'relative', height: bodyH }}>
              {hours.map((h, i) => <div key={h} style={{ position: 'absolute', top: i * PX_PER_HOUR - 6, right: 8, fontSize: 10.5, color: 'hsl(var(--muted-foreground))' }}>{wcFmt(h * 60)}</div>)}
            </div>
            {/* day columns */}
            <div ref={gridRef} style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, height: bodyH }}>
              {/* hour gridlines */}
              {hours.map((h, i) => <div key={'l' + h} style={{ position: 'absolute', top: i * PX_PER_HOUR, left: 0, right: 0, borderTop: '1px solid hsl(var(--border))' }} />)}
              {hours.slice(0, -1).map((h, i) => <div key={'hl' + h} style={{ position: 'absolute', top: i * PX_PER_HOUR + PX_PER_HOUR / 2, left: 0, right: 0, borderTop: '1px dashed hsl(var(--border) / 0.5)' }} />)}
              {/* now line (Wed ~10:30) */}
              {cols.indexOf(2) !== -1 && <div style={{ position: 'absolute', top: (10.5 - DAY_START) * PX_PER_HOUR, left: `${cols.indexOf(2) / cols.length * 100}%`, width: `${100 / cols.length}%`, borderTop: '2px solid hsl(var(--destructive))', zIndex: 5 }}><span style={{ position: 'absolute', left: 0, top: -4, width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--destructive))' }} /></div>}

              {/* column separators + empty states */}
              {cols.map((di, ci) => {
                const dayVisits = visits.filter((v) => v.day === di);
                return <div key={di} style={{ position: 'absolute', top: 0, bottom: 0, left: `${ci / cols.length * 100}%`, width: `${100 / cols.length}%`, borderLeft: ci ? '1px solid hsl(var(--border))' : 'none' }}>
                  {dayVisits.length === 0 && <div style={{ position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>No visits</div>}
                </div>;
              })}

              {/* visit blocks */}
              {cols.map((di, ci) => visits.filter((v) => v.day === di).map((v) => {
                const s = JOB_STATE[v.state] || JOB_STATE['Planned'];
                const top = (v.startMin - DAY_START * 60) / 60 * PX_PER_HOUR;
                const h = Math.max((v.endMin - v.startMin) / 60 * PX_PER_HOUR, 22);
                const active = selId === v._id;
                return <div key={v._id} onPointerDown={(e) => onPointerDown(e, v, 'move')}
                  style={{ position: 'absolute', top, height: h, left: `calc(${ci / cols.length * 100}% + 4px)`, width: `calc(${100 / cols.length}% - 8px)`,
                    background: s.bg, borderLeft: `3px solid ${s.bar}`, borderRadius: 6, padding: '4px 7px', cursor: 'grab', overflow: 'hidden', boxSizing: 'border-box',
                    outline: active ? `2px solid ${s.bar}` : '1px solid hsl(var(--border))', boxShadow: active ? 'var(--shadow-md)' : 'none', zIndex: active ? 6 : 2, touchAction: 'none', userSelect: 'none' }}>
                  <div onPointerDown={(e) => onPointerDown(e, v, 'top')} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, cursor: 'ns-resize' }} />
                  <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                  <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{wcFmt(v.startMin)} {tzAbbr(siteZoneFor(v.client))} time</div>
                  {h > 50 && <div style={{ fontSize: 9.5, color: 'hsl(var(--muted-foreground))', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.client}</div>}
                  <div onPointerDown={(e) => onPointerDown(e, v, 'bottom')} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, cursor: 'ns-resize' }} />
                </div>;
              }))}
            </div>
          </div>
        </div>

        {/* selected visit detail */}
        {selVisit ? <WorkerVisitDetail visit={{ ...selVisit, tech: tech.name }} onOpen={() => onOpenVisit && onOpenVisit(selVisit)} onClose={() => setSelId(null)} />
          : <Panel pad={20}><div style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13, padding: '24px 0' }}><Icon name="hand" size={22} /><div style={{ marginTop: 8, lineHeight: 1.5 }}>Click a visit to view its details, or drag to reschedule.</div></div></Panel>}
      </div>
    </div>
  );
}
const wcArrow = { border: 'none', background: 'hsl(var(--card))', padding: '8px 10px', cursor: 'pointer', display: 'inline-flex', color: 'hsl(var(--muted-foreground))' };

function WorkerVisitDetail({ visit: v, onOpen, onClose }) {
  const zone = siteZoneFor(v.client);
  return (
    <Panel pad={15}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Visit Details</h3>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><StatusBadge status={v.state} /><Icon name="x" size={15} color="hsl(var(--muted-foreground))" style={{ cursor: 'pointer' }} onClick={onClose} /></span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, margin: '9px 0 1px' }}>{v.title}</div>
      <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{v.client}</div>
      <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginBottom: 11 }}>{v.loc}{v.addr ? ', ' + v.addr : ''}</div>
      <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5 }}><Icon name="clock" size={14} color="hsl(var(--muted-foreground))" style={{ marginTop: 2 }} /><SiteTime time={v.time} zone={zone} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5 }}><Icon name="user" size={14} color="hsl(var(--muted-foreground))" />{v.tech}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 2 }}>
          <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Visit</span><IdChip id={v.sd} />
          <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginLeft: 4 }}>Job</span><IdChip id={v.fj} />
        </div>
      </div>
      <Button variant="primary" icon="external-link" onClick={onOpen} style={{ width: '100%', justifyContent: 'center', marginTop: 13 }}>Open Visit</Button>
    </Panel>
  );
}

Object.assign(window, { WorkerCalendar });
