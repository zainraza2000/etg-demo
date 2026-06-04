// ETG Dashboard — office/admin operational landing screen.
const { useState: useStateDash } = React;

function toneStyle(tone) { return statusStyle('', tone); }
function DashStateBadge({ label, tone, compact }) {
  const s = toneStyle(tone);
  return <span style={{ ...s, display: 'inline-flex', alignItems: 'center', gap: 5, padding: compact ? '1px 8px' : '2px 9px', borderRadius: 999, fontSize: compact ? 10.5 : 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />{label}</span>;
}

// ---- data (aggregated client-side from existing operational entities) ----
const DASH_KPIS = [
  { key: 'jobs', label: 'Jobs Today', value: '18', sub: 'scheduled visits today', icon: 'calendar-check', color: 'blue', to: 'calendar' },
  { key: 'techs', label: 'Techs Working', value: '14', sub: 'of 16 rostered', icon: 'users', color: 'green', to: 'calendar' },
  { key: 'overdue', label: 'Overdue', value: '2', sub: 'visits past due', icon: 'alarm-clock', color: 'red', tint: 'red', to: 'calendar' },
  { key: 'unassigned', label: 'Unassigned', value: '3', sub: 'awaiting a technician', icon: 'user-x', color: 'orange', tint: 'orange', to: 'calendar' },
  { key: 'blocked', label: 'Blocked', value: '4', sub: "can't proceed — needs action", icon: 'ban', color: 'red', tint: 'red', to: 'calendar' },
  { key: 'invready', label: 'Invoice Ready', value: '68%', sub: 'jobs ready to invoice', icon: 'receipt', color: 'violet', to: 'projects' },
];
const DASH_PILLS = [['Overdue', 'blocked'], ['Unassigned', 'warning'], ['Blocked', 'blocked'], ['Awaiting Client', 'active'], ['Awaiting Parts', 'warning'], ['Pending Approval', 'draft'], ['Needs Review', 'warning'], ['Ready to Convert', 'complete']];
const DASH_ACTIONS = [
  { id: 'ST-000105', icon: 'wrench', desc: 'CCTV cameras offline', who: 'ABC Corporate · Sydney Office', extra: 'High priority · 1 day overdue', state: 'Overdue', tone: 'blocked', flags: ['Overdue'], action: 'Open Ticket', to: 'tickets' },
  { id: 'ST-000094', icon: 'wrench', desc: 'Shared site — ownership unclear', who: 'ABC Corporate · Sydney Office', extra: 'Awaiting triage decision', state: 'Needs Review', tone: 'warning', flags: ['Needs Review'], action: 'Open Ticket', to: 'tickets' },
  { id: 'SD-000422', icon: 'calendar-x', desc: 'Network Upgrade — site access not confirmed', who: 'XYZ Building · Level 3', extra: 'Blocked: No site access', state: 'Blocked', tone: 'blocked', flags: ['Blocked', 'Awaiting Client'], action: 'Resolve Block', to: 'calendar' },
  { id: 'FJ-000288', icon: 'briefcase', desc: 'School Security Upgrade — unassigned visit', who: "St Mary's College · Main Campus", extra: 'Needs a licensed technician', state: 'Unassigned', tone: 'warning', flags: ['Unassigned'], action: 'Assign', to: 'calendar' },
  { id: 'USR-000014', icon: 'clock', desc: 'Liam Smith · timesheet not submitted', who: 'Week 2–8 Jun 2026', extra: 'No timesheet for today', state: 'No timesheet', tone: 'draft', flags: ['Pending Approval'], action: 'Review', to: 'timesheets' },
  { id: 'USR-000013', icon: 'clock', desc: 'Jake Murray · break missing — review', who: 'Tue 3 Jun 2026', extra: 'Long shift, no break recorded', state: 'Break missing', tone: 'warning', flags: ['Pending Approval'], action: 'Review', to: 'timesheets' },
  { id: 'IM-000061', icon: 'arrow-left-right', desc: 'TechVision $4,560 — PO missing', who: 'TechVision Wholesale', extra: 'Strong bank match, no job link', state: 'Blocked', tone: 'blocked', flags: ['Blocked'], action: 'Link Job/PO', to: 'invoice-matching' },
  { id: 'ST-000098', icon: 'wrench', desc: 'Fault resolved on call — ready to convert', who: 'Retail Group · Store 50', extra: 'Convert to a billable service job', state: 'Ready to Convert', tone: 'complete', flags: ['Ready to Convert'], action: 'Convert to Job', to: 'tickets' },
];
const DASH_VISITS = [
  { sd: 'SD-000401', fj: 'FJ-000310', title: 'CCTV Upgrade', client: 'ABC Corporate', site: 'Sydney Office', time: '8:00 AM', tech: 'Jake Murray', state: 'In Progress', tone: 'active' },
  { sd: 'SD-000402', fj: 'FJ-000311', title: 'Access Control Install', client: 'ABC Corporate', site: 'Sydney Office', time: '8:30 AM', tech: 'Liam Smith', state: 'Ready', tone: 'complete' },
  { sd: 'SD-000403', fj: 'FJ-000305', title: 'Automation Install', client: 'Fusion Manufacturing', site: 'Factory 1', time: '9:00 AM', tech: 'Michael Davis', state: 'At Risk: OT', tone: 'warning' },
  { sd: 'SD-000404', fj: 'FJ-000288', title: 'School Security Upgrade', client: "St Mary's College", site: 'Main Campus', time: '10:00 AM', tech: 'Unassigned', state: 'Blocked: Skills missing', tone: 'blocked' },
  { sd: 'SD-000405', fj: 'FJ-000277', title: 'Store 47 Maintenance', client: 'Retail Group', site: 'Store 47', time: '1:00 PM', tech: 'Anthony White', state: 'Ready', tone: 'complete' },
  { sd: 'SD-000406', fj: 'FJ-000402', title: 'Camera Maintenance', client: 'ABC Corporate', site: 'Level 1', time: '2:00 PM', tech: 'Brendan Lee', state: 'Blocked: Parts missing', tone: 'blocked' },
];
const DASH_PRESENCE = { 'On Site': 'hsl(var(--success))', 'Travelling': 'hsl(var(--warning))', 'On Break': 'hsl(var(--muted-foreground))' };
const DASH_AVAIL = [['Jake Murray', 'On Site', 4, '7.5h'], ['Liam Smith', 'Travelling', 3, '6.0h'], ['Michael Davis', 'On Site', 5, '8.0h'], ['Anthony White', 'On Site', 4, '6.5h'], ['Brendan Lee', 'On Site', 2, '4.0h']];
const DASH_METRICS = [
  { label: 'Active Jobs', value: '27', to: 'calendar' },
  { label: 'Open Tickets', value: '12', sub: '3 high priority', to: 'tickets' },
  { label: 'Pending Approvals', value: '5', tone: 'awaiting', to: 'timesheets' },
  { label: 'Timesheets Submitted', value: '11 / 14', sub: '3 outstanding today', tone: 'warning', to: 'timesheets' },
  { label: 'Margin Risk Projects', value: '3', tone: 'blocked', lock: true, to: 'projects' },
  { label: 'Invoice Readiness Failures', value: '4', tone: 'warning', lock: true, to: 'projects' },
  { label: 'Unmatched Bank Txns', value: '7', preview: true, to: 'invoice-matching' },
  { label: 'Offline Assets', value: '9', tone: 'warning', preview: true, to: 'assets' },
];

// ---- KPI card ----
function DashKpi({ k, active, onClick }) {
  const tintBg = k.tint === 'red' ? 'hsl(var(--destructive) / 0.05)' : k.tint === 'orange' ? 'hsl(var(--warning) / 0.05)' : 'hsl(var(--card))';
  return <div onClick={onClick} style={{ flex: '1 1 150px', minWidth: 0, background: active ? 'hsl(var(--primary-subtle))' : tintBg, border: `1px solid ${active ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`, borderRadius: 12, padding: 14, boxShadow: 'var(--shadow-sm)', cursor: 'pointer', position: 'relative' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, background: KPI_COLORS[k.color], display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={k.icon} size={19} color="#fff" /></span>
      <Icon name="lock" size={11} color="hsl(var(--muted-foreground))" />
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 9, lineHeight: 1, color: k.tint === 'red' ? 'hsl(var(--destructive))' : k.tint === 'orange' ? 'hsl(28 80% 40%)' : 'hsl(var(--foreground))' }}>{k.value}</div>
    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 5 }}>{k.label}</div>
    <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{k.sub}</div>
  </div>;
}

// ---- hover preview for a Needs Action row ----
function DashPreview({ a, rect, onOpen }) {
  const W = 340;
  const left = rect ? Math.min(rect.left + rect.width * 0.35, window.innerWidth - W - 16) : 200;
  const top = rect ? Math.min(Math.max(rect.top, 12), window.innerHeight - 230) : 80;
  return <div style={{ position: 'fixed', top, left, width: W, zIndex: 800, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-xl)', padding: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}><IdChip id={a.id} /><DashStateBadge label={a.state} tone={a.tone} compact /></div>
    <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>{a.desc}</div>
    <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="map-pin" size={12} />{a.who}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="info" size={12} />{a.extra}</span>
    </div>
    <button onClick={onOpen} style={{ width: '100%', marginTop: 11, height: 34, borderRadius: 8, border: 'none', background: 'hsl(var(--primary))', color: '#fff', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="arrow-right" size={14} />{a.action}</button>
  </div>;
}

function DashboardScreen({ onNavigate, onNewTicket, onNewProject }) {
  const [kpi, setKpi] = useStateDash(null);
  const [exFilter, setExFilter] = useStateDash(null);
  const [preview, setPreview] = useStateDash(null); // {id, rect}
  const go = (id) => onNavigate && onNavigate(id);
  const pillCount = (p) => DASH_ACTIONS.filter((a) => a.flags.includes(p)).length;
  const actions = exFilter ? DASH_ACTIONS.filter((a) => a.flags.includes(exFilter)) : DASH_ACTIONS;
  const previewA = preview && DASH_ACTIONS.find((a) => a.id === preview.id);

  return (
    <div>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Dashboard</h1>
            <Icon name="info" size={16} color="hsl(var(--muted-foreground))" />
          </div>
          <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0' }}>Today across ETG — jobs, technicians, tickets and approvals at a glance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: 'hsl(var(--foreground))', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 999, padding: '7px 13px' }}><Icon name="calendar-days" size={15} color="hsl(var(--muted-foreground))" />Thursday, 5 June 2026</span>
          <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Sydney NSW · your time (QLD)</span>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 12, marginBottom: 18 }}>
        {DASH_KPIS.map((k) => <DashKpi key={k.key} k={k} active={kpi === k.key} onClick={() => { setKpi(kpi === k.key ? null : k.key); go(k.to); }} />)}
      </div>

      {/* Needs Action + right rail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 304px', gap: 16, alignItems: 'start', marginBottom: 16 }}>
        <Panel pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, background: 'hsl(var(--destructive) / 0.12)' }}><Icon name="zap" size={15} color="hsl(var(--destructive))" /></span>
            <span style={{ fontSize: 14.5, fontWeight: 700 }}>Needs Action</span>
            <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>what needs you right now</span>
          </div>
          {/* exception pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
            {DASH_PILLS.map(([p, tone]) => { const n = pillCount(p); const on = exFilter === p; const s = toneStyle(tone);
              return <button key={p} onClick={() => setExFilter(on ? null : p)} disabled={n === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, cursor: n === 0 ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, opacity: n === 0 ? 0.4 : 1,
                background: on ? s.color : 'hsl(var(--card))', color: on ? '#fff' : s.color, border: `1px solid ${on ? s.color : s.border.replace('1px solid ', '')}` }}>
                {p}<span style={{ fontSize: 11, fontWeight: 700, background: on ? 'rgba(255,255,255,0.25)' : `${s.color.replace(')', ' / 0.14)')}`, borderRadius: 999, padding: '0 6px' }}>{n}</span></button>; })}
            {exFilter && <button onClick={() => setExFilter(null)} style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>}
          </div>
          {/* rows */}
          <div onMouseLeave={() => setPreview(null)}>
            {actions.map((a, i) => <div key={a.id} onMouseEnter={(e) => setPreview({ id: a.id, rect: e.currentTarget.getBoundingClientRect() })}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < actions.length - 1 ? '1px solid hsl(var(--border))' : 'none', boxShadow: a.tone === 'blocked' ? 'inset 3px 0 0 hsl(var(--destructive))' : (a.tone === 'warning' ? 'inset 3px 0 0 hsl(var(--warning))' : 'none') }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'hsl(var(--muted) / 0.7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={a.icon} size={16} color="hsl(var(--muted-foreground))" /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><IdChip id={a.id} /><DashStateBadge label={a.state} tone={a.tone} compact /></div>
                <div style={{ fontSize: 13, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.desc}</div>
              </div>
              <Button variant="primary" size="sm" icon="arrow-right" onClick={() => { setPreview(null); go(a.to); }} style={{ flexShrink: 0 }}>{a.action}</Button>
            </div>)}
            {actions.length === 0 && <div style={{ padding: '22px 16px', textAlign: 'center', fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>Nothing in this bucket.</div>}
          </div>
        </Panel>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 0 }}>
          <Panel title="Quick Actions">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[['briefcase', 'New Job', 'Create a field job', () => go('calendar')], ['wrench', 'New Ticket', 'Log a service ticket', () => onNewTicket && onNewTicket()], ['clock', 'New Timesheet', 'Add a labour entry', () => go('timesheets')], ['calendar-days', 'View Calendar', 'Open the command centre', () => go('calendar')]].map(([ic, label, sub, fn], i) =>
                <button key={i} onClick={fn} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', minHeight: 52, padding: '0 13px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                  border: i === 0 ? 'none' : '1px solid hsl(var(--border))', background: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--card))', color: i === 0 ? '#fff' : 'hsl(var(--foreground))' }}>
                  <Icon name={ic} size={18} color={i === 0 ? '#fff' : 'hsl(var(--primary))'} />
                  <span style={{ flex: 1 }}><span style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>{label}</span><span style={{ fontSize: 11, opacity: 0.7 }}>{sub}</span></span>
                  <Icon name="arrow-right" size={15} color={i === 0 ? '#fff' : 'hsl(var(--muted-foreground))'} /></button>)}
            </div>
          </Panel>
          <div style={{ background: 'hsl(215 35% 15%)', border: '1px solid hsl(var(--sidebar-border))', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(215 20% 65%)' }}>Company Health Score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, margin: '8px 0 10px' }}><span style={{ fontSize: 38, fontWeight: 900, lineHeight: 1, color: 'hsl(var(--success))' }}>78</span><span style={{ fontSize: 13, color: 'hsl(215 20% 65%)' }}>/100</span></div>
            <div style={{ height: 7, background: 'hsl(215 30% 24%)', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: '78%', background: 'hsl(var(--success))', borderRadius: 999 }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}><span style={{ color: 'hsl(var(--success))', fontWeight: 700, fontSize: 13 }}>Good</span><span style={{ color: 'hsl(211 70% 65%)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>View Details ›</span></div>
          </div>
        </div>
      </div>

      {/* Today's Schedule + Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Panel pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
            <Icon name="calendar-check" size={16} color="hsl(var(--primary))" /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Today's Schedule</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', cursor: 'pointer' }} onClick={() => go('calendar')}>Open Calendar ›</span>
          </div>
          {DASH_VISITS.map((v, i) => <div key={v.sd} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 16px', borderBottom: '1px solid hsl(var(--border))', boxShadow: v.tone === 'blocked' ? 'inset 3px 0 0 hsl(var(--destructive))' : 'none' }}>
            <div style={{ width: 62, flexShrink: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700 }}>{v.time}</div><div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }}><SiteTime time={v.time} zone={siteZoneFor(v.client)} small primaryColor="hsl(var(--muted-foreground))" /></div></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v.title}</div>
              <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 6 }}><IdChip id={v.sd} /><span>{v.client} · {v.site}</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
              <DashStateBadge label={v.state} tone={v.tone} compact />
              {v.tech === 'Unassigned'
                ? <button onClick={() => go('calendar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 9px', borderRadius: 999, border: '1px dashed hsl(var(--warning) / 0.6)', background: 'hsl(var(--warning) / 0.1)', color: 'hsl(28 80% 38%)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600 }}><Icon name="user-plus" size={12} />Assign</button>
                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}><Avatar name={v.tech} size={18} />{v.tech.split(' ')[0]}</span>}
            </div>
          </div>)}
          {/* technician availability strip */}
          <div style={{ padding: '11px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}><span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'hsl(var(--muted-foreground))' }}>Technician availability</span><UpcomingPill compact /></div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {DASH_AVAIL.map(([name, presence, visits, hrs]) => <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ position: 'relative' }}><Avatar name={name} size={28} /><span style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9, borderRadius: '50%', background: DASH_PRESENCE[presence], border: '2px solid hsl(var(--card))' }} /></span>
                <div><div style={{ fontSize: 12, fontWeight: 600 }}>{name.split(' ')[0]}</div><div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))' }}>{visits} visits · {hrs}</div></div>
              </div>)}
            </div>
          </div>
        </Panel>

        <Panel pad={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
            <Icon name="gauge" size={16} color="hsl(var(--primary))" /><span style={{ fontSize: 14.5, fontWeight: 700 }}>Key Metrics</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>operational health</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {DASH_METRICS.map((m, i) => { const accent = m.tone ? toneStyle(m.tone).color : 'hsl(var(--foreground))';
              return <div key={m.label} onClick={() => go(m.to)} style={{ padding: '13px 16px', borderBottom: i < DASH_METRICS.length - 2 ? '1px solid hsl(var(--border))' : 'none', borderRight: i % 2 === 0 ? '1px solid hsl(var(--border))' : 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{m.label}</span>
                  {m.lock && <Icon name="lock" size={10.5} color="hsl(var(--muted-foreground))" />}
                  {m.preview && <PreviewPill />}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1, color: accent }}>{m.value}</div>
                {m.sub && <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>{m.sub}</div>}
              </div>; })}
          </div>
        </Panel>
      </div>

      {previewA && <DashPreview a={previewA} rect={preview.rect} onOpen={() => { setPreview(null); go(previewA.to); }} />}
    </div>
  );
}

Object.assign(window, { DashboardScreen });
