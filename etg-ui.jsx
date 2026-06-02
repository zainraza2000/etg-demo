// ETG Dashboard UI kit — shared primitives & chrome.
const { useState, useEffect, useRef } = React;

// ---- Icon (lucide UMD) -----------------------------------------------------
function Icon({ name, size = 16, strokeWidth = 2, color, style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = `<i data-lucide="${name}"></i>`;
    window.lucide.createIcons({ attrs: { width: size, height: size, 'stroke-width': strokeWidth } });
  }, [name, size, strokeWidth]);
  return <span ref={ref} className={className} style={{ display: 'inline-flex', alignItems: 'center', color, ...style }} />;
}

// ---- Semantic colour helpers ----------------------------------------------
const KPI_COLORS = {
  blue:   'hsl(var(--primary))',
  green:  'hsl(var(--success))',
  orange: 'hsl(var(--warning))',
  red:    'hsl(var(--destructive))',
  violet: 'hsl(258 80% 64%)',
  slate:  'hsl(var(--status-invoiced))',
  teal:   'hsl(var(--accent))',
};
function statusStyle(status) {
  const s = (status || '').toLowerCase();
  const map = {
    'in progress': 'active', 'open': 'active', 'active': 'active',
    'planned': 'draft', 'draft': 'draft', 'low': 'draft',
    'on hold': 'warning', 'medium': 'warning', 'pending': 'warning',
    'overdue': 'blocked', 'blocked': 'blocked', 'high': 'blocked', 'offline': 'blocked',
    'critical': 'critical', 'urgent': 'critical',
    'complete': 'complete', 'resolved': 'complete', 'online': 'complete',
    'invoiced': 'invoiced',
  };
  const key = map[s] || 'active';
  const v = `var(--status-${key})`;
  return { background: `hsl(${v} / 0.13)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.30)` };
}
function healthColor(h) {
  if (h >= 75) return 'hsl(var(--success))';
  if (h >= 55) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}
function marginColor(m) { return m < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'; }

// ---- Avatar (initials) -----------------------------------------------------
const AV_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(258 70% 58%)', 'hsl(var(--success))', 'hsl(28 72% 48%)', 'hsl(199 80% 42%)'];
function initials(name) {
  if (!name || name === 'Unassigned') return '?';
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p[1]?.[0] || '')).toUpperCase();
}
function Avatar({ name, size = 28 }) {
  const unassigned = !name || name === 'Unassigned';
  const idx = unassigned ? 0 : (name.charCodeAt(0) + name.length) % AV_COLORS.length;
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: unassigned ? 'hsl(var(--muted))' : AV_COLORS[idx],
      color: unassigned ? 'hsl(var(--muted-foreground))' : '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 600, border: unassigned ? '1px dashed hsl(var(--border))' : 'none' }}>
      {unassigned ? <Icon name="user" size={size * 0.5} /> : initials(name)}
    </span>
  );
}

// ---- Button ----------------------------------------------------------------
function Button({ variant = 'primary', size = 'md', icon, children, onClick, style }) {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500,
    fontFamily: 'inherit', cursor: 'pointer', borderRadius: 8, whiteSpace: 'nowrap',
    transition: 'background .15s, color .15s', border: '1px solid transparent',
    height: size === 'sm' ? 36 : 40, padding: size === 'sm' ? '0 12px' : '0 15px',
    fontSize: size === 'sm' ? 13 : 14 };
  const variants = {
    primary: { background: 'hsl(var(--primary))', color: '#fff' },
    outline: { background: 'hsl(var(--card))', borderColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' },
    ghost: { background: 'transparent', color: 'hsl(var(--foreground))' },
    destructive: { background: 'hsl(var(--destructive))', color: '#fff' },
  };
  const [hover, setHover] = useState(false);
  const hov = {
    primary: { background: 'hsl(var(--primary) / 0.9)' },
    outline: { background: 'hsl(var(--accent-subtle))' },
    ghost: { background: 'hsl(var(--muted))' },
    destructive: { background: 'hsl(var(--destructive) / 0.9)' },
  };
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variants[variant], ...(hover ? hov[variant] : {}), ...style }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 16} />}{children}
    </button>
  );
}

// ---- Status / Priority badges ---------------------------------------------
function StatusBadge({ status }) {
  return <span style={{ ...statusStyle(status), display: 'inline-flex', alignItems: 'center',
    padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}
function PriorityBadge({ priority }) {
  const c = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[priority];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px',
    borderRadius: 999, fontSize: 12, fontWeight: 600, color: c, background: `${c.replace(')', ' / 0.12)')}` }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />{priority}</span>;
}
function RiskBadge({ risk }) {
  const map = { CRITICAL: 'blocked', HIGH: 'warning', LOW: 'complete' };
  return <span style={{ ...statusStyle(map[risk] === 'complete' ? 'complete' : map[risk] === 'warning' ? 'medium' : 'overdue'),
    display: 'inline-flex', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }}>{risk}</span>;
}
function HealthChip({ score }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid hsl(var(--border))',
    borderRadius: 7, padding: '2px 8px', fontWeight: 600, fontSize: 12.5 }}>
    {score}<span style={{ width: 8, height: 8, borderRadius: '50%', background: healthColor(score) }} /></span>;
}
function ProgressBar({ value, color = 'hsl(var(--primary))', width = 120 }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width, height: 7, background: 'hsl(var(--muted))', borderRadius: 999, overflow: 'hidden' }}>
      <span style={{ display: 'block', height: '100%', width: `${value}%`, background: color, borderRadius: 999 }} />
    </span><span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{value}%</span></span>;
}

// ---- KPI card + strip ------------------------------------------------------
function KpiCard({ title, value, sub, icon, color }) {
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12,
      padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 4px', letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}>{sub}</div>
      </div>
    </div>
  );
}
function KpiStrip({ items }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 14 }}>
    {items.map((k, i) => <KpiCard key={i} {...k} />)}</div>;
}

// ---- Page header -----------------------------------------------------------
function PageHeader({ title, description, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
          <Icon name="info" size={16} color="hsl(var(--muted-foreground))" />
        </div>
        {description && <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0' }}>{description}</p>}
      </div>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>{actions}</div>
    </div>
  );
}

// ---- Filter bar ------------------------------------------------------------
function Select({ label }) {
  return <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px',
    background: 'hsl(var(--card))', border: '1px solid hsl(var(--input))', borderRadius: 8, fontSize: 13.5,
    fontFamily: 'inherit', fontWeight: 500, color: 'hsl(var(--foreground))', cursor: 'pointer', whiteSpace: 'nowrap' }}>
    {label}<Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" /></button>;
}
function SearchInput({ placeholder }) {
  return <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }}><Icon name="search" size={16} /></span>
    <input placeholder={placeholder} style={{ width: '100%', height: 40, paddingLeft: 36, paddingRight: 12, boxSizing: 'border-box',
      border: '1px solid hsl(var(--input))', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'hsl(var(--card))' }} /></div>;
}
function ViewToggle({ options, value, onChange }) {
  return <div style={{ display: 'inline-flex', border: '1px solid hsl(var(--input))', borderRadius: 8, overflow: 'hidden' }}>
    {options.map((o, i) => {
      const on = o.id === value;
      return <button key={o.id} onClick={() => onChange(o.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
        border: 'none', borderLeft: i ? '1px solid hsl(var(--input))' : 'none', background: on ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))',
        color: on ? 'hsl(var(--primary))' : 'hsl(var(--foreground))', fontWeight: 500, fontSize: 13, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit' }}>
        <Icon name={o.icon} size={15} />{o.label}</button>;
    })}</div>;
}
function FilterBar({ search, filters, children }) {
  const [view, setView] = useState('list');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <SearchInput placeholder={search} />
      {filters.map((f, i) => <Select key={i} label={f} />)}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        {children || <ViewToggle value={view} onChange={setView} options={[{ id: 'list', label: 'List View', icon: 'list' }, { id: 'board', label: 'Board View', icon: 'layout-grid' }]} />}
      </div>
    </div>
  );
}

// ---- Pagination ------------------------------------------------------------
function Pagination({ label }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px 2px' }}>
    <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>{label}</span>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <PageBtn icon="chevron-left" />
      {['1', '2', '3'].map((p, i) => <PageBtn key={p} label={p} active={i === 0} />)}
      <PageBtn icon="chevron-right" />
    </div></div>;
}
function PageBtn({ label, icon, active }) {
  return <button style={{ minWidth: 34, height: 34, padding: '0 8px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
    border: active ? 'none' : '1px solid hsl(var(--input))', background: active ? 'hsl(var(--primary))' : 'hsl(var(--card))',
    color: active ? '#fff' : 'hsl(var(--foreground))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    {icon ? <Icon name={icon} size={15} /> : label}</button>;
}

// ---- Section card (panel) --------------------------------------------------
function Panel({ title, action, children, style, pad = 16 }) {
  return <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', ...style }}>
    {title && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `13px ${pad}px`, borderBottom: '1px solid hsl(var(--border))' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{title}</h3>{action}</div>}
    <div style={{ padding: pad }}>{children}</div>
  </div>;
}

// ---- Maturity affordances (shared across screens) -------------------------
// Upcoming  = roadmap, not live yet (violet).
// Preview   = real concept, data source not wired — value shown muted (amber).
// Read-only = system/engine-computed, never an input (slate lock).
function UpcomingPill({ compact }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: compact ? 10 : 10.5, fontWeight: 600, color: 'hsl(258 60% 50%)', background: 'hsl(258 80% 96%)', border: '1px solid hsl(258 70% 86%)', padding: '1px 7px', borderRadius: 999, whiteSpace: 'nowrap' }}><Icon name="sparkles" size={compact ? 10 : 11} />Upcoming</span>;
}
function PreviewPill() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'hsl(var(--warning))', background: 'hsl(var(--warning-subtle))', border: '1px solid hsl(var(--warning) / 0.3)', padding: '1px 7px', borderRadius: 999, whiteSpace: 'nowrap' }}><Icon name="eye" size={10} />Preview</span>;
}
function ReadOnlyTag({ compact }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: compact ? 10 : 10.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.7)', border: '1px solid hsl(var(--border))', padding: '1px 7px', borderRadius: 999, whiteSpace: 'nowrap' }}><Icon name="lock" size={compact ? 10 : 11} />Read-only</span>;
}
// Locked monospace identifier chip (e.g. PRJ-000142, ST-000077).
function IdChip({ id, note }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.5)', borderRadius: 999, padding: '4px 11px' }}>
    <Icon name="lock" size={12} color="hsl(var(--muted-foreground))" />
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--foreground))' }}>{id}</span>
    {note && <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>· {note}</span>}</span>;
}
// Quiet em-dash placeholder for a not-yet-computed engine value.
function PendingDash() { return <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>; }
// Dashed "Calculating…" card for an engine output with nothing to show yet.
function CalculatingCard({ note, height }) {
  return <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 10, padding: 14, textAlign: 'center', minHeight: height }}>
    <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: 'hsl(var(--muted-foreground))' }}>—</div>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}><Icon name="loader" size={13} />Calculating…</div>
    {note && <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5, marginTop: 6 }}>{note}</div>}
  </div>;
}

Object.assign(window, { Icon, Avatar, Button, StatusBadge, PriorityBadge, RiskBadge, HealthChip, ProgressBar,
  KpiCard, KpiStrip, PageHeader, FilterBar, Select, SearchInput, ViewToggle, Pagination, PageBtn, Panel,
  UpcomingPill, PreviewPill, ReadOnlyTag, IdChip, PendingDash, CalculatingCard,
  KPI_COLORS, statusStyle, healthColor, marginColor, initials });
