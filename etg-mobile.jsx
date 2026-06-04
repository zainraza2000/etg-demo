// ETG Technician Portal — field-worker app: data model + mobile primitives.
// Scoped to one technician (Brendan Lee, USR-000012). No finance, ever.
// Visual language: ETG tokens only, Inter + Geist Mono + lucide, flat surfaces,
// hairline dividers, one 8px spacing rhythm. The iOS bezel is only a frame.
const { useState: useStateM, useEffect: useEffectM, useRef: useRefM } = React;

// ---- duration / units ------------------------------------------------------
function mFmtDur(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${ss}`;
}
function mHm(sec) { const s = Math.max(0, Math.floor(sec)); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return `${h}h ${String(m).padStart(2, '0')}m`; }
function mMinsHm(min) { const h = Math.floor(min / 60); const m = Math.round(min % 60); return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`; }
const M_UNITS = ['each', 'metres', 'box', 'roll', 'litre', 'pair'];
const M_CONDITIONS = ['Good', 'Fair', 'Poor', 'Faulty'];
const BLOCK_REASONS = ['No site access', 'Client unavailable', 'Missing materials', 'Safety concern', 'Scope unclear / changed', 'Needs approval', 'Waiting on another trade', 'Other'];

// ---- the technician's jobs (no finance fields by design) -------------------
// checklists: typed groups, each item { label, req }. photosReq: { cat, req }.
const MJOBS = [
  {
    id: 'FJ-001052', title: 'CCTV Upgrade', client: 'ABC Corporate', site: 'Sydney Office',
    address: '14 George St, Sydney NSW 2000', contact: 'John Smith', role: 'Facilities Manager',
    phone: '0412 345 678', email: 'john.smith@abccorp.com.au',
    time: '8:00 AM – 12:00 PM', start: '8:00 AM', priority: 'High', cc: 'CC-000046', zone: 'Australia/Sydney',
    desc: 'Replace 4 reception dome cameras and re-terminate to the NVR. Verify coverage and recording before sign-off.',
    scope: ['Remove 4 faulty dome cameras', 'Install 4× Hikvision 8MP domes', 'Re-terminate Cat6 to the NVR', 'Verify recording + full coverage'],
    access: 'Report to reception for sign-in. Lift fob at the security desk. Roof / ceiling access requires an escort.',
    safetyNote: 'Working at heights — EWP permit on file.',
    checklists: [
      { key: 'prestart', label: 'Pre-start', icon: 'clipboard-check', items: [{ label: 'Site induction signed', req: true }, { label: 'JSA / SWMS reviewed', req: true }, { label: 'PPE on and checked', req: true }] },
      { key: 'safety', label: 'Safety', icon: 'hard-hat', items: [{ label: 'Working-at-heights controls in place', req: true }, { label: 'Ladder / EWP inspected', req: true }, { label: 'PoE isolated before any swap', req: true }] },
      { key: 'testing', label: 'Testing', icon: 'activity', items: [{ label: 'All 4 cameras streaming live', req: true }, { label: 'Recording verified on the NVR', req: true }, { label: 'Night / IR mode checked', req: false }] },
      { key: 'completion', label: 'Completion', icon: 'clipboard-list', items: [{ label: 'Full coverage checked with client', req: true }, { label: 'Work area cleaned up', req: true }, { label: 'Old units bagged for return', req: false }] },
      { key: 'commissioning', label: 'Asset commissioning', icon: 'box', items: [{ label: 'Cameras added to the register', req: true }, { label: 'Serial / MAC recorded', req: true }] },
    ],
    photosReq: [{ cat: 'Before', req: true }, { cat: 'During', req: false }, { cat: 'After', req: true }, { cat: 'Asset label', req: true }, { cat: 'Compliance', req: false }],
    assets: [['EG-0042', 'Reception Dome Camera', 'Hikvision DS-2CD2387G2'], ['EG-0043', 'Comms Switch', 'Ubiquiti USW-24-PoE']],
    materials: [{ name: 'Cat6 cable', qty: 35, unit: 'metres' }, { name: 'RJ45 mech', qty: 4, unit: 'each' }],
  },
  {
    id: 'FJ-001056', title: 'Intercom Fault', client: "St Mary's College", site: 'Main Campus',
    address: '1 College Rd, Brisbane QLD 4000', contact: 'Dana Reid', role: 'Site Manager',
    phone: '0455 221 904', email: 'dana.reid@stmarys.qld.edu.au',
    time: '1:00 PM – 2:30 PM', start: '1:00 PM', priority: 'Medium', cc: 'CC-000061', zone: 'Australia/Brisbane',
    desc: 'No audio on the front-entrance IP intercom. Diagnose and repair, or flag for replacement.',
    scope: ['Test intercom audio + handset', 'Check PoE + network path', 'Repair or recommend replacement'],
    access: 'Sign in at the front office. Escort required past reception during school hours.',
    safetyNote: 'Working around students — keep the area cordoned.',
    checklists: [
      { key: 'prestart', label: 'Pre-start', icon: 'clipboard-check', items: [{ label: 'Signed in at the office', req: true }, { label: 'WWCC sighted', req: true }, { label: 'Work area cordoned', req: false }] },
      { key: 'safety', label: 'Safety', icon: 'hard-hat', items: [{ label: 'Mind students — area cordoned', req: true }] },
      { key: 'testing', label: 'Testing', icon: 'activity', items: [{ label: 'Audio tested both ways', req: true }, { label: 'PoE / network path checked', req: false }] },
      { key: 'completion', label: 'Completion', icon: 'clipboard-list', items: [{ label: 'Fault diagnosed', req: true }, { label: 'Outcome noted for client', req: true }] },
    ],
    photosReq: [{ cat: 'Before', req: true }, { cat: 'Defect', req: false }, { cat: 'After', req: false }],
    assets: [['EG-0061', 'Front Entrance Intercom', '2N IP Verso']],
    materials: [],
  },
  {
    id: 'FJ-001061', title: 'Access Reader Swap', client: 'Retail Group', site: 'Store 47',
    address: '200 Hay St, Perth WA 6000', contact: 'Mark Lowe', role: 'Store Manager',
    phone: '0421 778 332', email: 'mark.lowe@retailgroup.com.au',
    time: '3:00 PM – 4:30 PM', start: '3:00 PM', priority: 'Low', cc: 'CC-000046', zone: 'Australia/Perth',
    desc: 'Swap the rear-door access reader and re-commission against the controller.',
    scope: ['Replace the rear-door reader', 'Re-commission to the controller', 'Test badge access'],
    access: 'Ask for the duty manager. Rear-door key from the office.',
    safetyNote: 'Loading dock — watch for vehicles.',
    checklists: [
      { key: 'prestart', label: 'Pre-start', icon: 'clipboard-check', items: [{ label: 'Duty manager notified', req: true }, { label: 'Rear-door key collected', req: true }] },
      { key: 'safety', label: 'Safety', icon: 'hard-hat', items: [{ label: 'Loading dock — watch for vehicles', req: true }] },
      { key: 'testing', label: 'Testing', icon: 'activity', items: [{ label: 'Badge access tested', req: true }] },
      { key: 'completion', label: 'Completion', icon: 'clipboard-list', items: [{ label: 'Old unit bagged for return', req: true }] },
      { key: 'commissioning', label: 'Asset commissioning', icon: 'box', items: [{ label: 'Reader re-commissioned to controller', req: true }] },
    ],
    photosReq: [{ cat: 'Before', req: true }, { cat: 'After', req: true }],
    assets: [['EG-0058', 'Rear Door Reader', 'HID Signo 20']],
    materials: [],
  },
];

// ---- lifecycle -------------------------------------------------------------
// Offered → Accepted → Travelling → On site → In progress → Complete → Submitted
// (Paused folds into the working step; Blocked is an off-track overlay.)
const LIFE_STEPS = [
  { key: 'accept', label: 'Accept' },
  { key: 'travel', label: 'Travel' },
  { key: 'onsite', label: 'On site' },
  { key: 'work', label: 'Working' },
  { key: 'complete', label: 'Complete' },
  { key: 'submit', label: 'Submitted' },
];
// How many steps are DONE for a given state (0..6).
const STATE_DONE = { 'Offered': 0, 'Accepted': 1, 'Travelling': 2, 'On site': 3, 'In progress': 3, 'Paused': 3, 'Complete': 5, 'Submitted': 6, 'Blocked': 1 };
function lifeIndex(state) { return STATE_DONE[state] != null ? STATE_DONE[state] : 0; }

// ---- status / priority -----------------------------------------------------
const M_STATE = {
  'Offered': 'draft', 'Accepted': 'active', 'Travelling': 'warning', 'On site': 'active',
  'In progress': 'active', 'Paused': 'warning', 'Complete': 'complete', 'Submitted': 'complete',
  'Blocked': 'blocked', 'Not started': 'draft',
};
function MStatePill({ state, big }) {
  const v = `var(--status-${M_STATE[state] || 'draft'})`;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: big ? '5px 12px' : '3px 9px', borderRadius: 7, fontSize: big ? 13 : 11.5, fontWeight: 600, whiteSpace: 'nowrap',
    background: `hsl(${v} / 0.12)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.28)` }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: `hsl(${v})` }} />{state}</span>;
}
function MPrio({ p }) {
  const c = p === 'High' ? 'var(--destructive)' : p === 'Medium' ? 'var(--warning)' : 'var(--status-draft)';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: `hsl(${c})` }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: `hsl(${c})` }} />{p} priority</span>;
}

// ---- lifecycle stepper -----------------------------------------------------
function Lifecycle({ state }) {
  const done = lifeIndex(state);
  const blocked = state === 'Blocked';
  const currentIdx = Math.min(done, LIFE_STEPS.length - 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {LIFE_STEPS.map((s, i) => {
        const isDone = i < done;
        const isCurrent = i === done && !blocked && done < LIFE_STEPS.length;
        const c = blocked && i === 1 ? 'var(--destructive)' : isDone ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--muted-foreground)';
        const fill = isDone || isCurrent || (blocked && i <= 1);
        return (
          <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ flex: 1, height: 2, background: i === 0 ? 'transparent' : (i <= done ? 'hsl(var(--success))' : 'hsl(var(--border))') }} />
              <span style={{ width: isCurrent ? 16 : 12, height: isCurrent ? 16 : 12, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: fill ? `hsl(${c})` : 'hsl(var(--card))', border: fill ? 'none' : '2px solid hsl(var(--border))', boxShadow: isCurrent ? `0 0 0 4px hsl(${c} / 0.15)` : 'none' }}>
                {isDone && <Icon name="check" size={8} color="#fff" />}
                {blocked && i === 1 && <Icon name="x" size={9} color="#fff" />}
              </span>
              <span style={{ flex: 1, height: 2, background: i === LIFE_STEPS.length - 1 ? 'transparent' : (i < done ? 'hsl(var(--success))' : 'hsl(var(--border))') }} />
            </div>
            <span style={{ fontSize: 9.5, marginTop: 5, fontWeight: i === currentIdx ? 700 : 500, letterSpacing: '-0.01em', textAlign: 'center', lineHeight: 1.1,
              color: i === currentIdx ? `hsl(${blocked ? 'var(--destructive)' : 'var(--primary)'})` : (isDone ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))') }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---- buttons (min 48px touch) ---------------------------------------------
const M_VARIANTS = {
  primary: { background: 'hsl(var(--primary))', color: '#fff', border: '1px solid transparent' },
  success: { background: 'hsl(var(--success))', color: '#fff', border: '1px solid transparent' },
  danger: { background: 'hsl(var(--destructive))', color: '#fff', border: '1px solid transparent' },
  outline: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' },
  ghost: { background: 'transparent', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' },
  subtle: { background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', border: '1px solid transparent' },
};
function MBtn({ variant = 'primary', icon, iconRight, children, onClick, disabled, full, size = 'md', style }) {
  const h = size === 'sm' ? 42 : 52;
  return <button className="m-press" onClick={disabled ? undefined : onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    minHeight: h, padding: size === 'sm' ? '0 14px' : '0 18px', width: full ? '100%' : undefined, borderRadius: 12, fontFamily: 'var(--font-sans)', fontSize: size === 'sm' ? 14 : 15.5, fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1, ...(M_VARIANTS[variant] || M_VARIANTS.primary), ...style }}>
    {icon && <Icon name={icon} size={18} />}{children}{iconRight && <Icon name={iconRight} size={18} />}</button>;
}

// ---- surfaces --------------------------------------------------------------
function MCard({ children, style, onClick, pad = 16, flat }) {
  return <div className={onClick ? 'm-press' : undefined} onClick={onClick} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 14, padding: pad, ...style }}>{children}</div>;
}
// Section: an uppercase overline + optional right slot, content below (no nested box by default).
function MSection({ title, count, right, children, style }) {
  return <div style={{ marginBottom: 22, ...style }}>
    {title && <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 10px' }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>{title}</span>
      {count != null && <span style={{ fontSize: 11.5, fontWeight: 700, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted))', borderRadius: 999, padding: '1px 8px' }}>{count}</span>}
      <span style={{ marginLeft: 'auto' }}>{right}</span>
    </div>}
    {children}
  </div>;
}
function MDivider() { return <div style={{ height: 1, background: 'hsl(var(--border))' }} />; }

// ---- form fields -----------------------------------------------------------
function MLabel({ children, req }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>{children}{req && <span style={{ color: 'hsl(var(--destructive))' }}> *</span>}</div>;
}
const M_INPUT = { width: '100%', minHeight: 48, borderRadius: 11, border: '1px solid hsl(var(--input))', padding: '0 13px', fontSize: 15.5, fontFamily: 'var(--font-sans)', boxSizing: 'border-box', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' };
function MInput({ value, onChange, placeholder, mono, inputMode, autoFocus }) {
  return <input autoFocus={autoFocus} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode}
    style={{ ...M_INPUT, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', height: 48 }} />;
}
function MSelect({ value, onChange, options }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...M_INPUT, height: 48, appearance: 'none', backgroundImage: 'none' }}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
}
function MToggle({ on, onChange, label, sub }) {
  return <button className="m-press" onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', minHeight: 52, padding: '8px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
    border: `1px solid ${on ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--border))'}`, background: on ? 'hsl(var(--success) / 0.07)' : 'hsl(var(--card))' }}>
    <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</div>{sub && <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{sub}</div>}</div>
    <span style={{ width: 46, height: 28, borderRadius: 999, flexShrink: 0, background: on ? 'hsl(var(--success))' : 'hsl(var(--muted))', position: 'relative', transition: 'background .15s' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,0.25)' }} /></span>
  </button>;
}
// chip/segment picker
function MChips({ value, options, onChange }) {
  return <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {options.map((o) => { const on = value === o;
      return <button key={o} className="m-press" onClick={() => onChange(o)} style={{ minHeight: 40, padding: '0 15px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
        border: `1px solid ${on ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`, background: on ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--card))', color: on ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>{o}</button>; })}
  </div>;
}

// ---- info row (label + value, optional action button) ----------------------
function MInfoRow({ icon, label, value, action, onAction, last }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: last ? 'none' : '1px solid hsl(var(--border))' }}>
    <Icon name={icon} size={18} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2, wordBreak: 'break-word' }}>{value}</div>
    </div>
    {action && <button className="m-press" onClick={onAction} aria-label={label} style={{ border: 'none', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', width: 44, height: 44, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name={action} size={19} /></button>}
  </div>;
}

// ---- bottom tab bar --------------------------------------------------------
function MTabBar({ active, onChange }) {
  const tabs = [['today', 'Today', 'house'], ['schedule', 'Schedule', 'calendar-days'], ['timesheet', 'Timesheet', 'clock'], ['profile', 'Profile', 'user']];
  return <div style={{ display: 'flex', borderTop: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', paddingBottom: 26, paddingTop: 8, flexShrink: 0 }}>
    {tabs.map(([id, label, icon]) => { const on = active === id;
      return <button key={id} className="m-press" onClick={() => onChange(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: '2px 0', color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
        <Icon name={icon} size={23} />
        <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500 }}>{label}</span></button>; })}
  </div>;
}

Object.assign(window, {
  mFmtDur, mHm, mMinsHm, M_UNITS, M_CONDITIONS, BLOCK_REASONS, MJOBS,
  LIFE_STEPS, STATE_DONE, lifeIndex, M_STATE, MStatePill, MPrio, Lifecycle,
  MBtn, MCard, MSection, MDivider, MLabel, M_INPUT, MInput, MSelect, MToggle, MChips, MInfoRow, MTabBar,
});
