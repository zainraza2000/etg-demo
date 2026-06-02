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
  const create = useWCRef(null);
  const [ghost, setGhost] = useWC(null); // {day, startMin, endMin}
  const [form, setForm] = useWC(null);   // New Visit form prefill or {} (empty)

  function commitTime(v) {
    return { ...v, time: wcFmt(v.startMin) + ' – ' + wcFmt(v.endMin) };
  }

  // ---- drag-to-create on empty grid ----
  function yToMin(clientY) {
    const r = gridRef.current.getBoundingClientRect();
    return wcSnap((clientY - r.top) / PX_PER_HOUR * 60 + DAY_START * 60);
  }
  function xToCol(clientX) {
    const r = gridRef.current.getBoundingClientRect();
    const ci = Math.max(0, Math.min(cols.length - 1, Math.floor((clientX - r.left) / (r.width / cols.length))));
    return cols[ci];
  }
  function onGridPointerDown(e) {
    if (drag.current) return;
    const start = yToMin(e.clientY); const day = xToCol(e.clientX);
    create.current = { day, anchor: start };
    setGhost({ day, startMin: start, endMin: start + MIN_DUR });
    window.addEventListener('pointermove', onCreateMove);
    window.addEventListener('pointerup', onCreateUp);
  }
  function onCreateMove(e) {
    const c = create.current; if (!c) return;
    let cur = yToMin(e.clientY);
    let s = Math.min(c.anchor, cur), en = Math.max(c.anchor, cur);
    if (en - s < MIN_DUR) en = s + MIN_DUR;
    s = Math.max(DAY_START * 60, s); en = Math.min(DAY_END * 60, en);
    setGhost({ day: c.day, startMin: s, endMin: en });
  }
  function onCreateUp() {
    window.removeEventListener('pointermove', onCreateMove);
    window.removeEventListener('pointerup', onCreateUp);
    const c = create.current; create.current = null;
    setGhost((g) => {
      if (g) openForm({ techIndex, day: g.day, startMin: g.startMin, endMin: g.endMin });
      return null;
    });
  }
  function openForm(prefill) {
    setForm(prefill || { techIndex });
  }
  function createVisit(v) {
    setVisits((vs) => vs.concat([{ ...v, _id: 'new-' + Date.now(), state: 'Planned',
      title: v.title || 'New Visit', client: v.client || tech.name, startMin: v.startMin, endMin: v.endMin, day: v.day,
      time: wcFmt(v.startMin) + ' – ' + wcFmt(v.endMin), sd: v.sd, fj: v.fj }]));
    setForm(null);
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

  if (form) return <NewVisitForm prefill={form} techIndex={techIndex} onCancel={() => setForm(null)} onCreate={createVisit} />;

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
          <Button variant="primary" icon="plus" onClick={() => openForm({ techIndex })}>New Visit</Button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 12 }}>
        <Icon name="move" size={13} color="hsl(var(--primary))" />Drag a visit to reschedule · drag its edges to change the time · drag an empty slot to create a visit
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

              {/* column separators + empty states + create-drag surface */}
              {cols.map((di, ci) => {
                const dayVisits = visits.filter((v) => v.day === di);
                return <div key={di} onPointerDown={onGridPointerDown} style={{ position: 'absolute', top: 0, bottom: 0, left: `${ci / cols.length * 100}%`, width: `${100 / cols.length}%`, borderLeft: ci ? '1px solid hsl(var(--border))' : 'none', cursor: 'crosshair', touchAction: 'none' }}>
                  {dayVisits.length === 0 && <div style={{ position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }}>No visits</div>}
                </div>;
              })}

              {/* live ghost (create) */}
              {ghost && cols.indexOf(ghost.day) !== -1 && (() => {
                const ci = cols.indexOf(ghost.day);
                const top = (ghost.startMin - DAY_START * 60) / 60 * PX_PER_HOUR;
                const h = Math.max((ghost.endMin - ghost.startMin) / 60 * PX_PER_HOUR, 16);
                return <div style={{ position: 'absolute', top, height: h, left: `calc(${ci / cols.length * 100}% + 4px)`, width: `calc(${100 / cols.length}% - 8px)`,
                  background: 'hsl(var(--primary) / 0.12)', border: '1.5px dashed hsl(var(--primary))', borderRadius: 6, padding: '3px 7px', zIndex: 7, pointerEvents: 'none', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: 'hsl(var(--primary))' }}>New visit</div>
                  <div style={{ fontSize: 9.5, color: 'hsl(var(--primary))' }}>{wcFmt(ghost.startMin)} – {wcFmt(ghost.endMin)}</div>
                </div>;
              })()}

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

const wcFormInput = { width: '100%', height: 40, border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '0 11px', boxSizing: 'border-box', fontSize: 13.5, fontFamily: 'inherit', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' };
function WvField({ label, req, tag, children }) {
  return <div><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><label style={{ fontSize: 12, fontWeight: 500 }}>{label}{req && <span style={{ color: 'hsl(var(--destructive))' }}> *</span>}</label>{tag}</div>{children}</div>;
}
function WvSelect({ value, ph, onClick }) {
  return <div onClick={onClick} style={{ ...wcFormInput, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}><span style={{ flex: 1 }}>{value || ph}</span><Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" /></div>;
}
function WvSection({ n, title, children }) {
  return <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
      <span style={{ width: 24, height: 24, borderRadius: 7, background: 'hsl(var(--primary-subtle))', color: 'hsl(var(--primary))', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h2>
    </div>{children}</div>;
}

function NewVisitForm({ prefill, techIndex, onCancel, onCreate }) {
  const [job, setJob] = useWC(null);          // selected FIELD_JOBS entry
  const [jobOpen, setJobOpen] = useWC(false);
  const [jobQuery, setJobQuery] = useWC('');
  const day = prefill.day != null ? prefill.day : 2;
  const startMin = prefill.startMin != null ? prefill.startMin : 480;
  const endMin = prefill.endMin != null ? prefill.endMin : 540;
  const tech = TECHS[prefill.techIndex != null ? prefill.techIndex : techIndex];
  const estHours = ((endMin - startMin) / 60).toFixed(2);
  const zone = job ? siteZoneFor(job.client) : null;
  // demo gate outcome keyed off the selected job (deterministic spread)
  const gate = !job ? null : ({
    'FJ-000310': ['ok', 'hsl(var(--success))', 'check-circle-2', 'OK to schedule', 'Technician is available and licensed for this window.'],
    'FJ-000311': ['warn', 'hsl(var(--warning))', 'alert-triangle', 'Warning — licence expires in 12 days, proceed?', 'Security Licence 1A renews 14 Jun 2026.'],
    'FJ-000305': ['block', 'hsl(var(--destructive))', 'ban', 'Blocked — technician double-booked 9:00–11:00', 'Resolve the overlap before this visit can be created.'],
    'FJ-000288': ['override', 'hsl(var(--destructive))', 'shield-alert', 'Override required — outside service region', 'A manager must approve scheduling outside the technician’s region.'],
  }[job.fj] || ['ok', 'hsl(var(--success))', 'check-circle-2', 'OK to schedule', 'Technician is available and licensed for this window.']);
  const blocked = gate && gate[0] === 'block';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onCancel} style={{ border: 'none', background: 'transparent', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: 0, display: 'inline-flex' }}><Icon name="arrow-left" size={16} /></button>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>New Visit</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.5)', borderRadius: 999, padding: '4px 12px' }}>
              <Icon name="lock" size={13} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>SD-000120</span>
              <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>· Assigned on creation</span></span>
          </div>
          <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0 26px' }}>Schedule an existing field job onto a technician’s calendar</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={() => !blocked && job && onCreate({ day, startMin, endMin, title: job.title, client: job.client, sd: 'SD-000120', fj: job.fj })}
            style={blocked || !job ? { opacity: 0.5, pointerEvents: 'none' } : {}}>Create Visit</Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1000 }}>
        <WvSection n="1" title="When & Who">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <WvField label="Technician" req><WvSelect value={`${tech.name}`} /></WvField>
            <WvField label="Date" req><WvSelect value={`${WC_DAYS[day]} ${WC_DATES[day]} May 2026`} /></WvField>
            <WvField label="Estimated hours" tag={<ReadOnlyTag />}><div style={{ ...wcFormInput, display: 'flex', alignItems: 'center', background: 'hsl(var(--muted) / 0.45)', color: 'hsl(var(--muted-foreground))' }}>{estHours} h</div></WvField>
            <WvField label="Start time" req><WvSelect value={zone ? null : wcFmt(startMin)}>{zone ? <SiteTime time={wcFmt(startMin)} zone={zone} oneline /> : null}</WvSelect></WvField>
            <WvField label="End time" req><WvSelect value={zone ? null : wcFmt(endMin)}>{zone ? <SiteTime time={wcFmt(endMin)} zone={zone} oneline /> : null}</WvSelect></WvField>
          </div>
          {zone && <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 9, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="clock" size={12} />Times shown in site time: <SiteTime time={wcFmt(startMin) + ' – ' + wcFmt(endMin)} zone={zone} oneline /></div>}
        </WvSection>

        <WvSection n="2" title="What">
          <WvField label="Field Job" req tag={<span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>the job this visit schedules</span>}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setJobOpen((o) => !o)} style={{ ...wcFormInput, height: 'auto', minHeight: 40, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '7px 11px' }}>
                {job ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: 1 }}><IdChip id={job.fj} /><span style={{ fontSize: 13 }}>{job.title}</span><span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>· {job.client} – {job.site}</span></span>
                  : <span style={{ flex: 1, color: 'hsl(var(--muted-foreground))' }}>Search and select a field job…</span>}
                <Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" />
              </div>
              {jobOpen && <div style={{ position: 'absolute', top: 44, left: 0, right: 0, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 9, boxShadow: 'var(--shadow-lg)', zIndex: 20, overflow: 'hidden' }}>
                <div style={{ position: 'relative', padding: 8, borderBottom: '1px solid hsl(var(--border))' }}>
                  <span style={{ position: 'absolute', left: 17, top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={14} color="hsl(var(--muted-foreground))" /></span>
                  <input autoFocus value={jobQuery} onChange={(e) => setJobQuery(e.target.value)} placeholder="Search jobs by FJ, title or client" style={{ ...wcFormInput, height: 34, paddingLeft: 30 }} />
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {FIELD_JOBS.filter((j) => (j.fj + ' ' + j.title + ' ' + j.client).toLowerCase().includes(jobQuery.toLowerCase())).map((j) =>
                    <div key={j.fj} onClick={() => { setJob(j); setJobOpen(false); setJobQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', cursor: 'pointer', borderBottom: '1px solid hsl(var(--border))' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted) / 0.5)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <IdChip id={j.fj} /><span style={{ fontSize: 13, fontWeight: 500 }}>{j.title}</span><span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>· {j.client} – {j.site}</span></div>)}
                </div>
                <div style={{ padding: '9px 11px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}><Icon name="plus" size={13} />New job<UpcomingPill compact /></div>
              </div>}
            </div>
          </WvField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <WvField label="Site"><div style={{ ...wcFormInput, display: 'flex', alignItems: 'center', color: job ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{job ? `${job.client} – ${job.site}` : 'Auto-filled from job'}</div></WvField>
            <WvField label="Cost Centre">{job ? <div style={{ ...wcFormInput, display: 'flex', alignItems: 'center', gap: 7 }}><IdChip id={job.cc} /></div> : <div style={{ ...wcFormInput, display: 'flex', alignItems: 'center', color: 'hsl(var(--muted-foreground))' }}>Auto-filled from job</div>}</WvField>
            <WvField label="Required Skills"><div style={{ ...wcFormInput, display: 'flex', alignItems: 'center', color: job ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{job ? job.skills.join(', ') : 'Auto-filled from job'}</div></WvField>
            <WvField label="Required Licences"><div style={{ ...wcFormInput, display: 'flex', alignItems: 'center', color: job ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{job ? job.licences.join(', ') : 'Auto-filled from job'}</div></WvField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 14 }}>
            <WvField label="Dispatch notes"><textarea placeholder="Optional notes for the technician" style={{ ...wcFormInput, height: 56, padding: 11, resize: 'none' }} /></WvField>
            <WvField label="Status" tag={<ReadOnlyTag />}><div style={{ ...wcFormInput, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'hsl(var(--muted) / 0.45)' }}><StatusBadge status="Planned" /><Icon name="lock" size={14} color="hsl(var(--muted-foreground))" /></div></WvField>
          </div>
        </WvSection>

        <WvSection n="3" title="Scheduling check">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>The scheduling engine validates technician + time + job.</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: 'hsl(var(--success))', background: 'hsl(var(--success-subtle))', border: '1px solid hsl(var(--success) / 0.3)', padding: '1px 8px', borderRadius: 999 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(var(--success))' }} />Live</span>
          </div>
          {!gate ? <div style={{ border: '1.5px dashed hsl(var(--border))', borderRadius: 9, padding: 16, textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>Select a field job to run the scheduling check.</div>
            : <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: `${gate[1].replace(')', ' / 0.1)')}`, border: `1px solid ${gate[1].replace(')', ' / 0.3)')}`, borderRadius: 9, padding: '12px 14px' }}>
              <Icon name={gate[2]} size={18} color={gate[1]} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: gate[1] }}>{gate[3]}</div>
                <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{gate[4]}</div>
                {gate[0] === 'override' && <div style={{ marginTop: 10 }}>
                  <textarea placeholder="Override reason (required)" style={{ ...wcFormInput, height: 50, padding: 10, resize: 'none' }} />
                  <div style={{ marginTop: 8 }}><WvSelect value="Select approver" ph="Select approver" /></div>
                </div>}
              </div>
            </div>}
        </WvSection>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 8 }}>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={() => !blocked && job && onCreate({ day, startMin, endMin, title: job.title, client: job.client, sd: 'SD-000120', fj: job.fj })}
            style={blocked || !job ? { opacity: 0.5, pointerEvents: 'none' } : {}}>Create Visit</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WorkerCalendar });