// ETG Dashboard — Timesheets: validation & approval engine surface.
const { useState: useStateTs } = React;

function tsStatusStyle(status) {
  const map = { 'Approved': 'complete', 'Pending': 'warning', 'Pending Approval': 'warning', 'Rejected': 'overdue', 'No Timesheet': 'draft' };
  const v = `var(--status-${map[status] || 'draft'})`;
  return { background: `hsl(${v} / 0.13)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.30)` };
}
function TsPill({ status }) {
  return <span style={{ ...tsStatusStyle(status), display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}
function TypePill({ type }) {
  if (!type) return <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>;
  const c = type === 'Billable' ? 'var(--info)' : 'var(--status-draft)';
  return <span style={{ background: `hsl(${c} / 0.12)`, color: `hsl(${c})`, padding: '2px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>{type}</span>;
}

// ---- break states (never "—") ----
const BRK = {
  'No break required': ['draft', 'minus', false],
  'Break recorded': ['complete', 'coffee', false],
  'No break taken': ['active', 'zap', false],
  'Break missing — review required': ['warning', 'alert-triangle', false],
  'Auto-deducted': ['draft', 'lock', true],
  'Manual override': ['warning', 'lock', true],
};
const BRK_SEQ = Object.keys(BRK);
function breakStateFor(e, gi) {
  if (e.brkState) return e.brkState;
  const h = parseFloat(e.hrs) || 0;
  const has = e.brk && e.brk !== '—' && e.brk !== '0' && e.brk !== '0:00';
  if (gi % 11 === 4) return 'Auto-deducted';
  if (gi % 11 === 7) return 'Manual override';
  if (gi % 11 === 9) return 'Break missing — review required';
  if (h >= 8 && !has) return 'Break missing — review required';
  if (has) return 'Break recorded' + (e.brk && /\d/.test(e.brk) ? `: ${e.brk}` : '');
  if (h < 5) return 'No break required';
  return 'No break taken';
}
function BreakBadge({ state }) {
  const base = state.split(':')[0];
  const [tone, icon, lock] = BRK[base] || BRK['No break taken'];
  const v = `var(--status-${tone})`;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap',
    background: `hsl(${v} / 0.12)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.28)` }}><Icon name={icon} size={10} />{state}{lock && <Icon name="lock" size={9} />}</span>;
}

// ---- approval-readiness badge (engine, read-only) ----
const READY = {
  'Ready to approve': 'complete', 'Missing break': 'warning', 'Missing job link': 'overdue',
  'Overtime review': 'warning', 'Invoice blocked': 'overdue', 'Rejected — needs correction': 'overdue', 'No timesheet submitted': 'draft',
};
function ReadinessBadge({ state, compact }) {
  const v = `var(--status-${READY[state] || 'draft'})`;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: compact ? '1px 8px' : '3px 10px', borderRadius: 999, fontSize: compact ? 10.5 : 11.5, fontWeight: 600, whiteSpace: 'nowrap',
    background: `hsl(${v} / 0.13)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.3)` }}><Icon name="lock" size={10} />{state}</span>;
}
function DualReady({ payroll, invoice }) {
  const cell = (label, ok) => { const v = ok ? 'var(--status-complete)' : 'var(--status-overdue)';
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, background: `hsl(${v} / 0.12)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.28)` }}><Icon name={ok ? 'check' : 'x'} size={10} />{label}</span>; };
  return <span style={{ display: 'inline-flex', gap: 6 }}>{cell('Payroll-ready', payroll)}{cell(invoice ? 'Invoice-ready' : 'Invoice blocked', invoice)}</span>;
}

// per-technician engine state (derived for the demo; explicit `readiness` wins)
function techState(t) {
  const ex = {
    'No timesheet submitted': { payroll: false, invoice: false, exceptions: [] },
    'Rejected — needs correction': { payroll: false, invoice: false, exceptions: [['Rejected entry needs correction', 'block'], ['Job not linked', 'block']] },
    'Missing break': { payroll: false, invoice: true, exceptions: [['Break missing', 'warn'], ['Travel unclassified', 'warn']] },
    'Missing job link': { payroll: false, invoice: false, exceptions: [['Billable line has no FJ link', 'block']] },
    'Overtime review': { payroll: false, invoice: true, exceptions: [['23.0 OT hrs — approval required', 'warn'], ['After-hours rate applies', 'warn']] },
    'Invoice blocked': { payroll: true, invoice: false, exceptions: [['Supplier cost unreconciled — invoice blocked', 'block']] },
    'Ready to approve': { payroll: true, invoice: true, exceptions: [] },
  };
  if (t.readiness && ex[t.readiness]) return { readiness: t.readiness, ...ex[t.readiness] };
  if (t.status === 'No Timesheet') return { readiness: 'No timesheet submitted', ...ex['No timesheet submitted'] };
  if (t.status === 'Rejected') return { readiness: 'Rejected — needs correction', ...ex['Rejected — needs correction'] };
  if (t.id === 'USR-000013') return { readiness: 'Missing break', ...ex['Missing break'] };
  return { readiness: 'Ready to approve', ...ex['Ready to approve'] };
}

// KPI card — clickable workflow filter
function TsKpiCard({ k, active, onClick }) {
  return (
    <div onClick={onClick} style={{ background: active ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', border: `1px solid ${active ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`, borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start', cursor: 'pointer' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[k.color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}><Icon name={k.icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{k.title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 4px', letterSpacing: '-0.02em', color: 'hsl(var(--muted-foreground))' }}>{k.value}</div>
        {k.caption && <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>{k.caption}</div>}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: 'hsl(var(--primary))' }}><Icon name="filter" size={11} />Click to filter</div>
      </div>
    </div>
  );
}

// ---- invoice readiness (per line) ----
const INV_STYLE = { 'Ready to invoice': 'complete', 'Invoiced ✓': 'invoiced', 'In review': 'active', 'Not ready': 'draft', 'Blocked': 'overdue' };
function deriveInv(e) {
  if (!e.type) return null;
  if (e.inv) return e.inv;
  if (e.type === 'Non-Billable') return '—';
  if (e.status === 'Approved') return 'Ready to invoice';
  if (e.status === 'Rejected') return 'Blocked';
  return 'Not ready';
}
function InvoicePill({ value }) {
  if (!value || value === '—') return <PendingDash />;
  const v = `var(--status-${INV_STYLE[value] || 'draft'})`;
  return <span style={{ display: 'inline-flex', padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap', background: `hsl(${v} / 0.1)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.25)`, opacity: 0.85 }}>{value}</span>;
}
function sumHrs(entries) { return entries.reduce((a, e) => a + (parseFloat(e.hrs) || 0), 0).toFixed(2); }

const TS_FILTERS = [
  { key: 'total', title: 'Total Hours', value: '243.25', caption: 'This Week', icon: 'clock', color: 'blue', match: () => true },
  { key: 'billable', title: 'Billable Hours', value: '198.50', caption: '81.6%', icon: 'dollar-sign', color: 'green', match: (t) => parseFloat(t.billable) > 0 },
  { key: 'pending', title: 'Pending Approval', value: '18.25 hrs', icon: 'user-check', color: 'violet', match: (t) => t.status === 'Pending Approval' },
  { key: 'rejected', title: 'Rejected Hours', value: '6.50 hrs', icon: 'x-circle', color: 'red', match: (t) => t.status === 'Rejected' },
  { key: 'nonbillable', title: 'Non-Billable Hours', value: '44.75 hrs', icon: 'clock', color: 'orange', match: (t) => parseFloat(t.nonBillable) > 0 },
  { key: 'approved', title: 'Approved Hours', value: '219.00 hrs', icon: 'check-circle-2', color: 'slate', match: (t) => t.status === 'Approved' },
];

let __gi = 0; // global break-index counter for state spread

function TimesheetsScreen() {
  const [expanded, setExpanded] = useStateTs({ 'USR-000013': true });
  const [filter, setFilter] = useStateTs(null);
  const [preview, setPreview] = useStateTs(null);     // { id, rect }
  const [approve, setApprove] = useStateTs(null);     // tech id for full approval
  const [statusOv, setStatusOv] = useStateTs({});     // { usrId: 'Approved' | ... }
  const [view, setView] = useStateTs('list');
  const [scope, setScope] = useStateTs({ tech: 'All Technicians', job: 'All Jobs', status: 'All Statuses' });
  const [page, setPage] = useStateTs(1);
  const PER = 8;
  const withStatus = (t) => statusOv[t.id] ? { ...t, status: statusOv[t.id] } : t;
  const filterDef = TS_FILTERS.find((f) => f.key === filter);
  const baseRows0 = TIMESHEETS.map(withStatus);
  const baseRows = baseRows0.filter((t) =>
    (scope.tech === 'All Technicians' || t.tech === scope.tech) &&
    (scope.status === 'All Statuses' || t.status === scope.status));
  const rows = filterDef ? baseRows.filter(filterDef.match) : baseRows;
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const pg = Math.min(page, pages);
  const previewTk = preview && baseRows.find((t) => t.id === preview.id);
  const approveTk = approve && baseRows.find((t) => t.id === approve);
  const setStatus = (id, s) => { setStatusOv((m) => ({ ...m, [id]: s })); setApprove(null); };
  __gi = 0;

  return (
    <div>
      <PageHeader title="Timesheets" description="Track, review and approve labour hours"
        actions={<>
          <Button variant="outline" icon="download">Export</Button>
          <Button variant="outline" icon="check-square" onClick={() => { setFilter('pending'); setPage(1); }}>Approvals</Button>
          <Button variant="primary" icon="plus">Add Time</Button>
        </>} />

      {/* clickable metric cards */}
      <div style={{ marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {TS_FILTERS.map((k) => <TsKpiCard key={k.key} k={k} active={filter === k.key} onClick={() => setFilter(filter === k.key ? null : k.key)} />)}
      </div>

      {/* filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {filterDef && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--primary))', background: 'hsl(var(--primary-subtle))', border: '1px solid hsl(var(--primary) / 0.3)', borderRadius: 999, padding: '5px 11px' }}>Filtered: {filterDef.title}<Icon name="x" size={13} style={{ cursor: 'pointer' }} onClick={() => setFilter(null)} /></span>}
        <Select label="Date Range" value="12 – 18 May 2026" options={['12 – 18 May 2026', '05 – 11 May 2026', '19 – 25 May 2026']} onChange={() => {}} />
        <Select label="Period" value="This Week" options={['This Week', 'Last Week', 'This Month', 'Custom']} onChange={() => {}} />
        <Select label="Technician" value={scope.tech} options={['All Technicians', ...TIMESHEETS.map((t) => t.tech)]} onChange={(v) => { setScope((s) => ({ ...s, tech: v })); setPage(1); }} />
        <Select label="Job" value={scope.job} options={['All Jobs', 'FJ-001052', 'FJ-001055', 'FJ-001064', 'FJ-001067']} onChange={(v) => setScope((s) => ({ ...s, job: v }))} />
        <Select label="Status" value={scope.status} options={['All Statuses', 'Approved', 'Pending Approval', 'Rejected', 'No Timesheet']} onChange={(v) => { setScope((s) => ({ ...s, status: v })); setPage(1); }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Select label="More Filters" /><UpcomingPill /></span>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', border: '1px solid hsl(var(--input))', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: view === 'list' ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', color: view === 'list' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="list" size={15} />List View</button>
          <button onClick={() => setView('calendar')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderLeft: '1px solid hsl(var(--input))', background: view === 'calendar' ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', color: view === 'calendar' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '8px 11px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="calendar" size={15} />Calendar View<UpcomingPill compact /></button>
        </div>
      </div>

      {view === 'calendar' ? <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', padding: 40, minHeight: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="calendar" size={30} color="hsl(var(--muted-foreground))" /></div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Calendar View</div>
        <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', maxWidth: 400 }}>A week-grid view of labour by technician and day is on the roadmap — clock events will plot here once the mobile capture feed is live.</div>
        <UpcomingPill />
      </div> :

      /* full-width grouped scan table */
      <div onMouseLeave={() => setPreview(null)} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '11px 16px', borderBottom: '1px solid hsl(var(--border))', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>Timesheets<PreviewPill /><span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 400, color: 'hsl(var(--muted-foreground))' }}>Hover a technician for a quick preview · open to approve</span></div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {rows.slice((pg - 1) * PER, pg * PER).map((t) => {
              const isExp = expanded[t.id] && t.entries.length > 0;
              const st = techState(t);
              const block = st.exceptions.some(([, sev]) => sev === 'block');
              return (
                <React.Fragment key={t.id}>
                  {/* technician header row */}
                  <tr onMouseEnter={(e) => setPreview({ id: t.id, rect: e.currentTarget.getBoundingClientRect() })} onClick={() => setApprove(t.id)}
                    style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: 'hsl(var(--muted) / 0.3)', boxShadow: block ? 'inset 3px 0 0 hsl(var(--destructive))' : (st.readiness !== 'Ready to approve' && t.status !== 'No Timesheet' && t.status !== 'Approved' ? 'inset 3px 0 0 hsl(var(--warning))' : 'none') }}>
                    <td style={{ padding: '11px 12px', width: 28 }}>{t.entries.length > 0 && <span onClick={(e) => { e.stopPropagation(); setExpanded({ ...expanded, [t.id]: !expanded[t.id] }); }} style={{ cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}><Icon name={isExp ? 'chevron-down' : 'chevron-right'} size={16} /></span>}</td>
                    <td style={{ padding: '10px 8px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={t.tech} size={32} /><div><div style={{ fontWeight: 600 }}>{t.tech}</div><div style={{ marginTop: 3 }}><IdChip id={t.usr} /></div></div></div></td>
                    <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12.5 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PreviewPill />{t.total} hrs · B {t.billable} / NB {t.nonBillable}</span></td>
                    <td><DualReady payroll={st.payroll} invoice={st.invoice} /></td>
                    <td><ReadinessBadge state={st.readiness} /></td>
                    <td style={{ textAlign: 'right', padding: '10px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><TsPill status={t.status} /><Icon name="chevron-right" size={15} color="hsl(var(--muted-foreground))" /></span></td>
                  </tr>
                  {/* expanded day/entry lines */}
                  {isExp && <tr><td colSpan={6} style={{ padding: 0, background: 'hsl(var(--card))' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                      <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        {['Date', 'Job / Task', 'Location', 'Start / End', 'Breaks', 'Hours', 'Type', 'Status', 'Invoice'].map((h, i) =>
                          <th key={i} style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11, color: 'hsl(var(--muted-foreground))', padding: i === 0 ? '8px 12px 8px 52px' : '8px 12px' }}>
                            {['Breaks', 'Hours', 'Type', 'Status', 'Invoice'].includes(h) ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>{h}<ReadOnlyTag /></span> : h}</th>)}
                      </tr></thead>
                      <tbody>
                        {(() => {
                          const real = t.entries.filter((e) => e.type); const out = []; const byDay = {}; const order = [];
                          real.forEach((e) => { if (!byDay[e.day]) { byDay[e.day] = []; order.push(e.day); } byDay[e.day].push(e); });
                          order.forEach((day) => {
                            const lines = byDay[day]; const multi = lines.length > 1;
                            if (multi) out.push(<tr key={'s' + day} style={{ background: 'hsl(var(--muted) / 0.4)' }}><td style={{ padding: '6px 12px 6px 52px', fontWeight: 600, fontSize: 11.5 }}>{day} · {sumHrs(lines)}h total</td><td colSpan={8} style={{ padding: '6px 12px', fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{lines.length} jobs</td></tr>);
                            lines.forEach((e, k) => { const bs = breakStateFor(e, __gi++); out.push(
                              <tr key={day + k} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                <td style={{ padding: '9px 12px 9px 52px', color: multi ? 'hsl(var(--muted-foreground))' : 'inherit' }}>{multi ? '' : e.day}</td>
                                <td style={{ padding: '9px 12px', color: e.job.startsWith('FJ') ? 'hsl(var(--primary))' : 'inherit', fontWeight: e.job.startsWith('FJ') ? 500 : 400 }}>{e.job}</td>
                                <td style={{ padding: '9px 12px', color: 'hsl(var(--muted-foreground))' }}>{e.loc}</td>
                                <td style={{ padding: '9px 12px' }}><SiteTime time={e.time} zone={siteZoneFor(e.loc)} small /></td>
                                <td style={{ padding: '9px 12px' }}><BreakBadge state={bs} /></td>
                                <td style={{ padding: '9px 12px', fontWeight: 600 }}>{e.hrs}</td>
                                <td style={{ padding: '9px 12px' }}><TypePill type={e.type} /></td>
                                <td style={{ padding: '9px 12px' }}><TsPill status={e.status} /></td>
                                <td style={{ padding: '9px 12px' }}><InvoicePill value={deriveInv(e)} /></td>
                              </tr>); });
                          });
                          return out;
                        })()}
                      </tbody>
                    </table>
                  </td></tr>}
                </React.Fragment>
              );
            })}
            {/* subcontractor row variant */}
            <SubcontractorRow />
          </tbody>
        </table>
        <div style={{ padding: '0 16px 8px' }}><Pagination label={`Showing ${rows.length === 0 ? 0 : (pg - 1) * PER + 1} to ${Math.min(pg * PER, rows.length)} of ${rows.length} technicians`} page={pg} pages={pages} onPage={setPage} /></div>
      </div>}

      {previewTk && <TsPreview t={previewTk} rect={preview.rect} onOpen={() => { setApprove(previewTk.id); setPreview(null); }} />}
      {approveTk && <ApprovalDrawer t={approveTk} onClose={() => setApprove(null)} onStatus={setStatus} />}
    </div>
  );
}

function SubcontractorRow() {
  return <tr style={{ borderTop: '2px solid hsl(var(--border))', background: 'hsl(var(--accent-subtle) / 0.5)' }}>
    <td></td>
    <td style={{ padding: '11px 8px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: '50%', background: 'hsl(var(--accent))', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>HW</span><div><div style={{ fontWeight: 600 }}>Hi-Wire Contracting</div><div style={{ marginTop: 3, fontSize: 10.5, fontWeight: 600, color: 'hsl(var(--accent))', background: 'hsl(var(--accent-subtle))', border: '1px solid hsl(var(--accent) / 0.3)', padding: '1px 7px', borderRadius: 999, display: 'inline-block' }}>Subcontractor — claim flow</div></div></div></td>
    <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12.5 }}>Claim attached · PO-001302</td>
    <td style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Agreed-rate check · Retention 5%</td>
    <td><span style={{ ...tsStatusStyle('Pending Approval'), display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}><Icon name="file-text" size={11} />Payment approval</span></td>
    <td style={{ textAlign: 'right', padding: '10px 16px' }}><UpcomingPill compact /></td>
  </tr>;
}

// ---- hover preview bubble ----
function TsPreview({ t, rect, onOpen }) {
  const st = techState(t); const W = 330;
  const left = rect ? Math.min(rect.left + 340, window.innerWidth - W - 16) : 200;
  const top = rect ? Math.min(Math.max(rect.top, 12), window.innerHeight - 300) : 80;
  const block = st.exceptions.some(([, s]) => s === 'block');
  return <div style={{ position: 'fixed', top, left, width: W, zIndex: 800, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-xl)', padding: 15 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar name={t.tech} size={30} /><div><div style={{ fontWeight: 700, fontSize: 14 }}>{t.tech}</div><IdChip id={t.usr} /></div></div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '11px 0' }}><ReadinessBadge state={st.readiness} compact /><DualReady payroll={st.payroll} invoice={st.invoice} /></div>
    <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginBottom: 8 }}>{t.total} hrs · Billable {t.billable} · Non-billable {t.nonBillable}</div>
    {st.exceptions.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>{st.exceptions.slice(0, 3).map(([x, sev], i) =>
      <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: sev === 'block' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))' }}><Icon name={sev === 'block' ? 'ban' : 'alert-triangle'} size={13} />{x}</div>)}</div>
      : <div style={{ fontSize: 12, color: 'hsl(var(--success))', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check-circle-2" size={13} />No exceptions — ready to approve</div>}
    <button onClick={onOpen} style={{ width: '100%', marginTop: 12, height: 34, borderRadius: 8, border: 'none', background: 'hsl(var(--primary))', color: '#fff', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="external-link" size={14} />Open to approve</button>
  </div>;
}

// ---- full approval drawer (heavy surface) ----
function LifecycleChips() {
  const stages = ['Draft', 'Submitted', 'Pending Approval', 'Approved for Job Costing', 'Approved for Payroll', 'Rejected', 'Adjustment Required', 'Locked', 'Exported to Payroll'];
  const up = { 'Adjustment Required': true };
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
    {stages.map((s, i) => <React.Fragment key={s}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: i <= 2 ? 'hsl(var(--primary-subtle))' : (up[s] ? 'hsl(258 80% 96%)' : 'hsl(var(--muted) / 0.5)'), color: i <= 2 ? 'hsl(var(--primary))' : (up[s] ? 'hsl(258 60% 50%)' : 'hsl(var(--muted-foreground))') }}>{s}{up[s] && <Icon name="sparkles" size={10} />}</span>
      {i < stages.length - 1 && <Icon name="chevron-right" size={11} color="hsl(var(--muted-foreground))" />}</React.Fragment>)}
  </div>;
}
function DrawerSection({ title, tag, children }) {
  return <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 13, marginTop: 13 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>{tag}</div>{children}</div>;
}
function ApprovalDrawer({ t, onClose, onStatus }) {
  const st = techState(t); const block = st.exceptions.some(([, s]) => s === 'block');
  const entries = t.entries.filter((e) => e.type);
  const [dtab, setDtab] = React.useState('Summary');
  const [composer, setComposer] = React.useState(null);
  const TABS = ['Summary', `Entries (${entries.length})`, 'Breaks', 'Notes'];
  let gi = 0;
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'hsl(222 47% 11% / 0.35)', zIndex: 900 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 600, maxWidth: '94vw', background: 'hsl(var(--background))', zIndex: 901, boxShadow: 'var(--shadow-xl)', overflowY: 'auto' }}>
        {/* header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 2, background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><Avatar name={t.tech} size={34} /><span><span style={{ fontSize: 15, fontWeight: 700 }}>{t.tech}</span> <IdChip id={t.usr} /><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Week {t.week || '—'}</div></span></span>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'inline-flex' }}><Icon name="x" size={18} /></button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, margin: '10px 0' }}><ReadinessBadge state={st.readiness} compact /><DualReady payroll={st.payroll} invoice={st.invoice} /></div>
          <div style={{ display: 'flex', gap: 9 }}>
            <Button variant="primary" icon="check" onClick={() => !block && onStatus && onStatus(t.id, 'Approved')} style={{ flex: 1, justifyContent: 'center', background: 'hsl(var(--success))', ...(block ? { opacity: 0.5, pointerEvents: 'none' } : {}) }}>Approve</Button>
            <Button variant="destructive" icon="x" onClick={() => onStatus && onStatus(t.id, 'Rejected')} style={{ flex: 1, justifyContent: 'center' }}>Reject</Button>
            <Button variant="outline" icon="rotate-ccw" onClick={() => onStatus && onStatus(t.id, 'Pending Approval')} style={{ flex: 1, justifyContent: 'center' }}>Request changes</Button>
          </div>
          {block && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11.5, color: 'hsl(var(--destructive))' }}><Icon name="ban" size={13} />Approve disabled — resolve block-class exceptions first.</div>}
          {/* detail tab strip */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, marginBottom: -14 }}>
            {TABS.map((tab) => { const on = dtab === tab.split(' ')[0] || dtab === tab;
              const key = tab.startsWith('Entries') ? 'Entries' : tab;
              const active = dtab === key;
              return <button key={tab} onClick={() => setDtab(key)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 12.5, fontWeight: active ? 600 : 500, cursor: 'pointer',
                color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', borderBottom: active ? '2px solid hsl(var(--primary))' : '2px solid transparent', padding: '0 0 10px' }}>{tab}</button>; })}
          </div>
        </div>

        <div style={{ padding: '16px 18px 40px' }}>
          {dtab === 'Summary' && <TsSummaryTab t={t} st={st} composer={composer} setComposer={setComposer} />}
          {dtab === 'Breaks' && <div>{entries.map((e, i) => { const bs = breakStateFor(e, gi++); return <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '9px 11px', marginBottom: 7, fontSize: 12.5 }}>
            <span><span style={{ fontWeight: 600 }}>{e.day}</span> <span style={{ color: 'hsl(var(--muted-foreground))' }}>· {e.job}</span></span><BreakBadge state={bs} /></div>; })}</div>}
          {dtab === 'Notes' && <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', padding: '16px 0', display: 'flex', alignItems: 'center', gap: 7 }}><Icon name="sticky-note" size={15} />No notes yet<ReadOnlyTag /></div>}
          {dtab === 'Entries' && <React.Fragment>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {(st.exceptions.length ? st.exceptions : [['No exceptions', 'ok']]).map(([x, sev], i) => {
              const v = sev === 'block' ? 'var(--status-overdue)' : sev === 'warn' ? 'var(--status-warning)' : 'var(--status-complete)';
              return <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: `hsl(${v} / 0.12)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.28)` }}><Icon name={sev === 'block' ? 'ban' : sev === 'warn' ? 'alert-triangle' : 'check-circle-2'} size={11} />{x}{sev === 'block' && ' (block)'}</span>;
            })}
          </div>

          {/* entries with break + labour controls + gap chips */}
          <DrawerSection title="Entries">
            {entries.map((e, i) => { const bs = breakStateFor(e, gi++); return <div key={i}>
              {i > 0 && <div style={{ display: 'flex', gap: 5, padding: '4px 0 4px 8px' }}>{['Travel', 'Admin', 'Unallocated'].slice(0, 1 + (i % 3)).map((g) => <span key={g} style={{ fontSize: 9.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.6)', border: '1px solid hsl(var(--border))', borderRadius: 999, padding: '0 7px' }}>gap: {g}</span>)}<PreviewPill /></div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid hsl(var(--border))', borderRadius: 9, padding: '9px 11px', marginBottom: 7 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}><span style={{ color: e.job.startsWith('FJ') ? 'hsl(var(--primary))' : 'inherit', fontWeight: 600, fontSize: 12.5 }}>{e.job}</span><TypePill type={e.type} /><InvoicePill value={deriveInv(e)} /></div>
                  <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>{e.loc} · <SiteTime time={e.time} zone={siteZoneFor(e.loc)} oneline /></div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}><BreakBadge state={bs} />{['standard', 'OT', 'Saturday'][i % 3] !== 'standard' && <span style={{ fontSize: 9.5, fontWeight: 600, color: 'hsl(var(--warning))', background: 'hsl(var(--warning-subtle))', padding: '1px 7px', borderRadius: 999 }}>{['standard', 'OT', 'Saturday'][i % 3]} rate</span>}</div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{e.hrs}h</span>
              </div>
            </div>; })}
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="info" size={12} />Award / OT classification flagged by ETG; payroll applies the multiplier.</div>
          </DrawerSection>

          {/* per-entry profitability (canonical) */}
          <DrawerSection title="Profitability" tag={<span style={{ display: 'inline-flex', gap: 5 }}><ReadOnlyTag /><UpcomingPill /></span>}>
            <div style={{ background: 'hsl(var(--muted) / 0.4)', borderRadius: 9, padding: 12, fontSize: 12.5 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>FJ-001052 — CCTV Upgrade</div>
              {[['Quoted labour', '12h'], ['Actual', '16.5h'], ['Overrun', '4.5h'], ['Margin impact', '−$540']].map(([k, v]) =>
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: 'hsl(var(--muted-foreground))' }}><span>{k}</span><span style={{ fontWeight: 600, color: k === 'Margin impact' ? 'hsl(var(--destructive))' : 'hsl(var(--foreground))' }}>{v}</span></div>)}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--warning))' }}><Icon name="alert-triangle" size={13} />Requires review before invoice</div>
            </div>
          </DrawerSection>

          {/* cost-centre + labour-type rules */}
          <DrawerSection title="Allocation & labour type" tag={<PreviewPill />}>
            {[['CC-000045', 'Electrical', '5.0'], ['CC-000046', 'CCTV', '3.5']].map(([cc, n, h]) =>
              <div key={cc} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ flex: 1, display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--input))', borderRadius: 7, padding: '6px 9px', background: 'hsl(var(--muted) / 0.45)' }}><Icon name="lock" size={10} />{cc}<span style={{ fontFamily: 'var(--font-sans)' }}>· {n}</span></span>
                <span style={{ width: 50, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--input))', borderRadius: 7, padding: '6px 9px', background: 'hsl(var(--muted) / 0.45)' }}>{h}h</span></div>)}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '7px 11px', marginTop: 4, fontSize: 12.5, background: 'hsl(var(--muted) / 0.45)', color: 'hsl(var(--muted-foreground))' }}><span>Labour type: Internal admin → non-billable</span><Icon name="chevron-down" size={14} /></div>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>Rule-bound: "Internal admin" forces chargeable-to-client = false (reason required).</div>
          </DrawerSection>

          {/* reason codes */}
          <DrawerSection title="Reason codes" tag={<PreviewPill />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {[['Non-billable reason', 'Internal admin'], ['Rejected-time reason', 'Wrong job selected']].map(([l, v]) =>
                <div key={l}><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>{l}</div><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '7px 10px', fontSize: 12, background: 'hsl(var(--card))' }}>{v}<Icon name="chevron-down" size={13} color="hsl(var(--muted-foreground))" /></div></div>)}
            </div>
          </DrawerSection>

          {/* scheduled vs actual */}
          <DrawerSection title="Scheduled vs actual" tag={<span style={{ display: 'inline-flex', gap: 5 }}><PreviewPill /><ReadOnlyTag /></span>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[['Late start', 'warn'], ['Ran over planned time', 'warn'], ['Time variance +2.0 h', 'warn']].map(([l, s], i) =>
                <span key={i} style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--warning))', background: 'hsl(var(--warning-subtle))', border: '1px solid hsl(var(--warning) / 0.3)', borderRadius: 999, padding: '2px 9px' }}>{l}</span>)}
              <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 4 }}>vs SD-000091 · reason required</span>
            </div>
          </DrawerSection>

          {/* audit trail */}
          <DrawerSection title="Audit trail / approval history" tag={<ReadOnlyTag />}>
            {[['Submitted by technician (mobile)', 'B. Lee · 18 May 5:42 PM'], ['Hours auto-captured from clock events', 'System · 18 May'], ['Manual override: approved with no break', 'J. Manager · reason recorded']].map(([a, m], i) =>
              <div key={i} style={{ display: 'flex', gap: 9, padding: '5px 0', borderBottom: i < 2 ? '1px solid hsl(var(--border))' : 'none' }}><Icon name="dot" size={14} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0, marginTop: 1 }} /><div><div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{a}</div><div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))' }}>{m}</div></div></div>)}
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="lock" size={11} />On approve the entry locks; any override requires a reason.</div>
          </DrawerSection>

          {/* status lifecycle (split) */}
          <DrawerSection title="Status lifecycle — payroll vs job-costing" tag={<UpcomingPill />}><LifecycleChips /></DrawerSection>

          {/* performance roll-up */}
          <DrawerSection title="Technician performance" tag={<span style={{ display: 'inline-flex', gap: 5 }}><ReadOnlyTag /><UpcomingPill /></span>}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
              {['Billable 84%', 'On-time 100%', 'Rejected 0', 'Overruns 1', 'Score impact: Positive'].map((c, i) =>
                <span key={i} style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>{c}</span>)}
            </div>
          </DrawerSection>

          {/* mobile submit mini-flow */}
          <DrawerSection title="Mobile technician submit" tag={<UpcomingPill />}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>
              {['Start / finish', 'Job', 'Travel / admin / break', 'Notes / photos', 'Submit'].map((s, i) => <React.Fragment key={s}><span style={{ background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', borderRadius: 7, padding: '3px 9px' }}>{s}</span>{i < 4 && <Icon name="arrow-right" size={11} />}</React.Fragment>)}
            </div>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 6 }}>The engine does validation — not the phone.</div>
          </DrawerSection>
          </React.Fragment>}
        </div>
      </div>
    </React.Fragment>
  );
}

function TsSummaryTab({ t, st, composer, setComposer }) {
  const rows = [['Total Hours', `${t.total} hrs`], ['Billable Hours', `${t.billable} hrs (${t.billablePct}%)`], ['Non-Billable Hours', `${t.nonBillable} hrs (${t.nonBillablePct}%)`], ['Overtime Hours', `${t.overtime || '0.00'} hrs`], ['Standard Hours', `${t.standard || t.total} hrs`], ['Breaks', `${t.breaks || '1.00'} hr`]];
  const QA = [['plus-circle', 'Add Time Entry', 'time'], ['coffee', 'Add Break', 'break'], ['pencil', 'Add Note', 'note'], ['upload', 'Upload Receipt / File', 'upload'], ['copy', 'Copy Last Week', 'copy'], ['user', 'View Technician Profile', 'profile']];
  const HEALTH = [['All entries have start and end times', true], ['Breaks are within allowed limits', true], ['1 entry exceeds 10 hours', false], ['No overlapping time entries', true], ['1 non-billable entry – review notes', false]];
  return (
    <React.Fragment>
      {/* summary stats */}
      <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 14 }}>
        {rows.map(([k, v], i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, borderBottom: i < rows.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
          <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>)}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid hsl(var(--border))' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5 }}><Avatar name="John Manager" size={22} /><span><span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11.5 }}>Approver</span><div style={{ fontWeight: 600 }}>John Manager</div></span></span>
        </div>
      </div>

      {/* Quick Actions */}
      <DrawerSection title="Quick Actions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {QA.map(([ic, l, key]) => <div key={key}>
            <div onClick={() => setComposer(composer === key ? null : key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '9px 11px', fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={ic} size={14} />{l}</span><Icon name="arrow-right" size={14} /></div>
            {composer === key && <div style={{ border: '1px solid hsl(var(--input))', borderRadius: 8, padding: 10, marginTop: 6, background: 'hsl(var(--muted) / 0.3)' }}>
              {(key === 'time' || key === 'break' || key === 'note') && <div>
                <input autoFocus placeholder={key === 'note' ? 'Type a note…' : key === 'break' ? 'Break duration e.g. 0:30' : 'Job / hours…'} style={{ width: '100%', height: 32, border: '1px solid hsl(var(--input))', borderRadius: 6, padding: '0 9px', fontSize: 12.5, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
                  <button onClick={() => setComposer(null)} style={{ height: 28, padding: '0 12px', border: 'none', borderRadius: 6, background: 'hsl(var(--primary))', color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                  <button onClick={() => setComposer(null)} style={{ height: 28, padding: '0 12px', border: '1px solid hsl(var(--input))', borderRadius: 6, background: 'hsl(var(--card))', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                </div></div>}
              {key === 'upload' && <div style={{ border: '1.5px dashed hsl(var(--border))', borderRadius: 7, padding: '14px', textAlign: 'center', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}><Icon name="upload-cloud" size={18} /><div style={{ marginTop: 4 }}>Drop a file to attach</div></div>}
              {key === 'copy' && <div style={{ fontSize: 12, color: 'hsl(var(--success))', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="check-circle-2" size={14} />Last week's entries copied — review</div>}
              {key === 'profile' && <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{t.tech} · {t.usr} · Billable 84% · On-time 100%</div>}
            </div>}
          </div>)}
        </div>
      </DrawerSection>

      {/* Timesheet Health */}
      <DrawerSection title="Timesheet Health" tag={<ReadOnlyTag />}>
        {HEALTH.map(([l, ok], i) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', fontSize: 12.5 }}>
          <Icon name={ok ? 'check-circle-2' : 'alert-triangle'} size={15} color={ok ? 'hsl(var(--success))' : 'hsl(var(--warning))'} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ color: ok ? 'hsl(var(--foreground))' : 'hsl(var(--warning))' }}>{l}</span></div>)}
      </DrawerSection>
    </React.Fragment>
  );
}

Object.assign(window, { TimesheetsScreen });
