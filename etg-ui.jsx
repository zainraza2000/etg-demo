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
function statusStyle(status, tone) {
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
  const key = tone || map[s] || 'active';
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
// `tone` overrides the status→colour lookup for screen-specific vocabularies
// (e.g. "Potential Match" → active). `compact` tightens it for dense tables.
function StatusBadge({ status, tone, compact }) {
  return <span style={{ ...statusStyle(status, tone), display: 'inline-flex', alignItems: 'center',
    padding: compact ? '2px 9px' : '2px 10px', borderRadius: 999, fontSize: compact ? 11 : 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
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
// Unified KPI card used across every screen. Bottom-line modes (pick one):
//  · sub      — a primary-coloured action link ("View all", "View report")
//  · tag      — a maturity pill node (ReadOnlyTag / PreviewPill / UpcomingPill)
//  · filter   — renders a "Click to filter" affordance (workflow filter cards)
// Optional `caption` adds a muted supporting line above the bottom element.
// `value == null` renders an em dash (engine value not yet computed).
// `valueMuted` greys the number; `iconOpacity` dims the colour chip; `basis`
// is the flex grow-basis used for wrap behaviour.
function KpiCard({ title, value, sub, caption, tag, filter, icon, color, valueSize = 24, valueMuted = false, iconOpacity = 1, basis = 0, onClick, active }) {
  const clickable = !!onClick;
  return (
    <div onClick={onClick} style={{ background: active ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', border: `1px solid ${active ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`, borderRadius: 12,
      flex: `1 1 ${basis}px`, minWidth: 0, padding: 14, boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', cursor: clickable ? 'pointer' : 'default' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, opacity: iconOpacity, marginBottom: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={20} color="#fff" /></div>
      <div title={value == null ? '—' : String(value)} style={{ fontSize: valueSize, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: valueMuted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value == null ? '—' : value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{title}</div>
      {caption != null && <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{caption}</div>}
      <div style={{ marginTop: 'auto', paddingTop: 6, minWidth: 0, overflow: 'hidden' }}>
        {tag ? tag
          : filter ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'hsl(var(--primary))' }}><Icon name="filter" size={11} />Click to filter</div>
          : sub != null ? <div style={{ fontSize: 12, fontWeight: 500, color: 'hsl(var(--primary))', cursor: clickable ? 'pointer' : 'default', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
          : null}
      </div>
    </div>
  );
}
// KPI cards lay out in a single non-wrapping row; cards share width (flex 1 1 0,
// minWidth 0) and shrink to fit instead of dropping to a second row.
function KpiStrip({ items }) {
  return <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 12 }}>
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
// Real dropdown. `label` is the trigger prefix (e.g. "Status"); `value` the
// current selection; `options` an array of strings; `onChange(value)`.
function Select({ label, value, options, onChange, leadDot }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') setOpen(false);
      else if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min((options || []).length - 1, h + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
      else if (e.key === 'Enter' && options) { onChange && onChange(options[hi]); setOpen(false); } };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key); };
  }, [open, hi, options, onChange]);
  const display = value != null ? (label ? `${label}: ${value}` : value) : label;
  const trigger = (e) => { if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) return; if (e.type === 'keydown') e.preventDefault(); setOpen((o) => !o); };
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={trigger} onKeyDown={trigger} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px',
        background: open ? 'hsl(var(--accent-subtle))' : 'hsl(var(--card))', border: `1px solid ${open ? 'hsl(var(--ring))' : 'hsl(var(--input))'}`, borderRadius: 8, fontSize: 13.5,
        fontFamily: 'inherit', fontWeight: 500, color: 'hsl(var(--foreground))', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        {leadDot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: leadDot }} />}
        {display}<Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .12s' }} /></button>
      {open && options && <div style={{ position: 'absolute', top: 44, left: 0, zIndex: 50, minWidth: '100%', maxHeight: 280, overflowY: 'auto',
        background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 9, boxShadow: 'var(--shadow-lg)', padding: 4 }}>
        {options.map((o, i) => { const sel = o === value;
          return <div key={o} onMouseEnter={() => setHi(i)} onClick={() => { onChange && onChange(o); setOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
              background: i === hi ? 'hsl(var(--muted))' : 'transparent', color: 'hsl(var(--foreground))', fontWeight: sel ? 600 : 400 }}>
            <span style={{ width: 14, flexShrink: 0 }}>{sel && <Icon name="check" size={14} color="hsl(var(--primary))" />}</span>{o}</div>; })}
      </div>}
    </div>
  );
}
function SearchInput({ placeholder, value, onChange }) {
  return <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }}><Icon name="search" size={16} /></span>
    <input value={value || ''} onChange={(e) => onChange && onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', height: 40, paddingLeft: 36, paddingRight: value ? 34 : 12, boxSizing: 'border-box',
      border: '1px solid hsl(var(--input))', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'hsl(var(--card))' }} />
    {value && <span onClick={() => onChange && onChange('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'inline-flex' }}><Icon name="x" size={15} /></span>}
  </div>;
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
// `filters` may be plain strings (static) or {label,value,options,onChange} objects.
function FilterBar({ search, searchValue, onSearch, filters, children, view, onView, viewOptions }) {
  const [v, setV] = useState('list');
  const curView = view !== undefined ? view : v;
  const setView = onView || setV;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <SearchInput placeholder={search} value={searchValue} onChange={onSearch} />
      {(filters || []).map((f, i) => typeof f === 'string'
        ? <Select key={i} label={f} />
        : <Select key={i} label={f.label} value={f.value} options={f.options} onChange={f.onChange} />)}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        {children || <ViewToggle value={curView} onChange={setView} options={viewOptions || [{ id: 'list', label: 'List View', icon: 'list' }, { id: 'board', label: 'Board View', icon: 'layout-grid' }]} />}
      </div>
    </div>
  );
}

// ---- Pagination ------------------------------------------------------------
// Stateful: `page` (1-based), `pages` total, `onPage(n)`. Prev disabled on 1,
// Next on last. Shows up to 5 numbered buttons windowed around the active page.
function Pagination({ label, page = 1, pages = 1, onPage }) {
  const set = (n) => { if (onPage && n >= 1 && n <= pages) onPage(n); };
  let start = Math.max(1, Math.min(page - 2, pages - 4));
  const nums = []; for (let i = start; i <= Math.min(pages, start + 4); i++) nums.push(i);
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px 2px' }}>
    <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>{label}</span>
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <PageBtn icon="chevron-left" disabled={page <= 1} onClick={() => set(page - 1)} />
      {nums.map((p) => <PageBtn key={p} label={String(p)} active={p === page} onClick={() => set(p)} />)}
      <PageBtn icon="chevron-right" disabled={page >= pages} onClick={() => set(page + 1)} />
    </div></div>;
}
function PageBtn({ label, icon, active, disabled, onClick }) {
  return <button onClick={disabled ? undefined : onClick} style={{ minWidth: 34, height: 34, padding: '0 8px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
    border: active ? 'none' : '1px solid hsl(var(--input))', background: active ? 'hsl(var(--primary))' : 'hsl(var(--card))',
    color: active ? '#fff' : 'hsl(var(--foreground))', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
// ---- Site context header — Customer → Site → Job/Ticket (the core link) ----
// Makes the hierarchy instantly clear at the top of any work item.
function SiteContextHeader({ customer, site, address, contact, link, tech, needsSite }) {
  const cell = (icon, label, value, accent) => <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
    <Icon name={icon} size={15} color="hsl(var(--muted-foreground))" style={{ marginTop: 2, flexShrink: 0 }} />
    <div style={{ minWidth: 0 }}><div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1, color: accent || 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div></div>
  </div>;
  return <div style={{ border: '1px solid hsl(var(--border))', borderLeft: '3px solid hsl(var(--primary))', borderRadius: 10, background: 'hsl(var(--primary-subtle) / 0.4)', padding: '11px 14px', marginBottom: 14 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, alignItems: 'start' }}>
      {cell('building-2', 'Customer', customer || '—')}
      {needsSite
        ? cell('map-pin', 'Site', <span style={{ color: 'hsl(var(--warning))' }}>Site required</span>, 'hsl(var(--warning))')
        : cell('map-pin', 'Site', site || '—')}
      {cell('navigation', 'Address', address || '—')}
      {link && cell('link', 'Linked Job / Ticket', link)}
      {contact && cell('user', 'Site Contact', contact)}
      {tech && cell('hard-hat', 'Assigned Tech', tech)}
    </div>
  </div>;
}

function CalculatingCard({ note, height }) {
  return <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 10, padding: 14, textAlign: 'center', minHeight: height }}>
    <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color: 'hsl(var(--muted-foreground))' }}>—</div>
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}><Icon name="loader" size={13} />Calculating…</div>
    {note && <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5, marginTop: 6 }}>{note}</div>}
  </div>;
}

// ---- Row action menu (kebab) — shared across dense tables ------------------
// `items`: [{ icon, label, onClick, up (Upcoming), danger, divider:true }].
// Fixed-positioned so it escapes overflow:hidden table cards; closes on outside
// click, Escape, scroll or resize.
function RowMenu({ items, size = 16, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  function toggle(e) { e.stopPropagation(); setRect(e.currentTarget.getBoundingClientRect()); setOpen((o) => !o); }
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close); document.addEventListener('keydown', key);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); document.removeEventListener('keydown', key); };
  }, [open]);
  const W = 212;
  const left = rect ? (align === 'right' ? Math.min(rect.right - W, window.innerWidth - W - 8) : Math.min(rect.left, window.innerWidth - W - 8)) : 0;
  let top = rect ? rect.bottom + 5 : 0;
  const estH = (items || []).length * 34 + 8;
  if (rect && top + estH > window.innerHeight - 8) top = Math.max(8, rect.top - estH - 5);
  return (
    <React.Fragment>
      <button onClick={toggle} aria-label="Row actions" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 7,
        border: '1px solid transparent', background: open ? 'hsl(var(--muted))' : 'transparent', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'hsl(var(--muted))'; }} onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
        <Icon name="more-vertical" size={size} />
      </button>
      {open && <React.Fragment>
        <div onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 1200 }} />
        <div style={{ position: 'fixed', top, left, width: W, zIndex: 1201, background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 10, boxShadow: 'var(--shadow-xl)', padding: 5 }}>
          {(items || []).map((it, i) => it.divider
            ? <div key={i} style={{ height: 1, background: 'hsl(var(--border))', margin: '5px 6px' }} />
            : <button key={i} onClick={(e) => { e.stopPropagation(); setOpen(false); it.onClick && it.onClick(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, padding: '7px 9px', borderRadius: 7, color: it.danger ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted))'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <Icon name={it.icon} size={14} color={it.danger ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'} />
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.up && <Icon name="sparkles" size={11} color="hsl(258 70% 60%)" />}
              </button>)}
        </div>
      </React.Fragment>}
    </React.Fragment>
  );
}

Object.assign(window, { Icon, Avatar, Button, StatusBadge, PriorityBadge, RiskBadge, HealthChip, ProgressBar,
  KpiCard, KpiStrip, PageHeader, FilterBar, Select, SearchInput, ViewToggle, Pagination, PageBtn, Panel, RowMenu,
  UpcomingPill, PreviewPill, ReadOnlyTag, IdChip, PendingDash, CalculatingCard, SiteContextHeader,
  KPI_COLORS, statusStyle, healthColor, marginColor, initials });
