// ETG Dashboard — Timesheets screen.
const { useState: useStateTs } = React;

function tsStatusStyle(status) {
  const map = { 'Approved': 'complete', 'Pending': 'warning', 'Pending Approval': 'warning', 'Rejected': 'overdue', 'No Timesheet': 'draft' };
  const key = map[status] || 'draft';
  const v = `var(--status-${key})`;
  return { background: `hsl(${v} / 0.13)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.30)` };
}
function TsPill({ status }) {
  return <span style={{ ...tsStatusStyle(status), display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}
function TypePill({ type, ro }) {
  if (!type) return <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>;
  const billable = type === 'Billable';
  const c = billable ? 'var(--info)' : 'var(--status-draft)';
  return <span style={{ background: `hsl(${c} / 0.12)`, color: `hsl(${c})`, padding: '2px 9px', borderRadius: 6, fontSize: 11.5, fontWeight: 600 }}>{type}</span>;
}
// KPI card — labour-engine figures whose feed isn't live (Preview, muted).
function TsKpiCard({ title, value, sub, icon, color }) {
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 4px', letterSpacing: '-0.02em', color: 'hsl(var(--muted-foreground))' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>{sub}</div>
        <PreviewPill />
      </div>
    </div>
  );
}

// ---- Invoice readiness (engine-derived, read-only) ----
const INV_STYLE = {
  'Ready to invoice': 'complete', 'Invoiced ✓': 'invoiced', 'In review': 'active', 'Not ready': 'draft', 'Blocked': 'overdue',
};
function deriveInv(e) {
  if (!e.type) return null;                       // empty placeholder row
  if (e.inv) return e.inv;                        // explicit
  if (e.type === 'Non-Billable') return '—';      // nothing to invoice
  if (e.status === 'Approved') return 'Ready to invoice';
  if (e.status === 'Rejected') return 'Blocked';
  return 'Not ready';                             // Pending billable
}
function InvoicePill({ value }) {
  if (!value || value === '—') return <PendingDash />;
  const key = INV_STYLE[value] || 'draft';
  const v = `var(--status-${key})`;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap',
    background: `hsl(${v} / 0.10)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.25)`, opacity: 0.85 }}>{value}</span>;
}
// sum "8.50"-style hours strings
function sumHrs(entries) {
  const n = entries.reduce((acc, e) => acc + (parseFloat(e.hrs) || 0), 0);
  return n.toFixed(2);
}

function TimesheetsScreen() {
  const [selected, setSelected] = useStateTs('USR-000013');
  const [expanded, setExpanded] = useStateTs('USR-000012');
  const sheet = TIMESHEETS.find((t) => t.id === selected);

  return (
    <div>
      <PageHeader title="Timesheets" description="Track, review and approve labour hours"
        actions={<>
          <Button variant="outline" icon="download">Export</Button>
          <Button variant="outline" icon="check-square">Approvals</Button>
          <Button variant="primary" icon="plus">Add Time</Button>
        </>} />
      <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {TIMESHEET_KPIS.map((k, i) => <TsKpiCard key={i} {...k} />)}
      </div>

      {/* filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Select label="12 – 18 May 2026" />
        <Select label="This Week" />
        <Select label="All Technicians" />
        <Select label="All Jobs" />
        <Select label="All Statuses" />
        <Select label="More Filters" />
        <div style={{ marginLeft: 'auto', display: 'inline-flex', border: '1px solid hsl(var(--input))', borderRadius: 8, overflow: 'hidden' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'hsl(var(--primary-subtle))', color: 'hsl(var(--primary))', fontWeight: 500, fontSize: 13, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="list" size={15} />List View</button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderLeft: '1px solid hsl(var(--input))', background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '8px 11px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="calendar" size={15} />Calendar View<UpcomingPill compact /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid hsl(var(--border))', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>Timesheets<PreviewPill /></div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {TIMESHEETS.map((t) => {
                const isExp = expanded === t.id && t.entries.length > 0;
                const isSel = selected === t.id;
                return (
                  <React.Fragment key={t.id}>
                    <tr onClick={() => setSelected(t.id)} style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'hsl(var(--muted) / 0.25)' }}>
                      <td style={{ padding: '11px 16px', width: 28 }}>
                        {t.entries.length > 0
                          ? <span onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : t.id); }} style={{ cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}><Icon name={isExp ? 'chevron-down' : 'chevron-right'} size={16} /></span>
                          : <span style={{ width: 16, display: 'inline-block' }} />}
                      </td>
                      <td style={{ padding: '11px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={t.tech} size={32} />
                          <div><div style={{ fontWeight: 600 }}>{t.tech}</div><div style={{ marginTop: 3 }}><IdChip id={t.usr} /></div></div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><PreviewPill />Total: {t.total} hrs</span></td>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12.5 }}>Billable: {t.billable} hrs ({t.billablePct}%)</td>
                      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12.5 }}>Non-Billable: {t.nonBillable} hrs ({t.nonBillablePct}%)</td>
                      <td style={{ textAlign: 'right', padding: '11px 16px' }}><TsPill status={t.status} /></td>
                    </tr>
                    {isExp && <tr>
                      <td colSpan={6} style={{ padding: 0, background: 'hsl(var(--card))' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                          <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                            {['Date', 'Job / Task', 'Location', 'Start / End Time', 'Breaks', 'Hours', 'Type', 'Status', 'Invoice', ''].map((h, i) =>
                              <th key={i} style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11, color: 'hsl(var(--muted-foreground))', padding: i === 0 ? '8px 16px 8px 52px' : '8px 12px' }}>
                                {h === 'Location' || h === 'Hours' || h === 'Type' || h === 'Status' ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>{h}<ReadOnlyTag /></span>
                                  : h === 'Invoice' ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>{h}<ReadOnlyTag /></span> : h}</th>)}
                          </tr></thead>
                          <tbody>
                            {(() => {
                              const real = t.entries.filter((e) => e.type);
                              const empty = t.entries.filter((e) => !e.type);
                              // group real entries by day, preserving first-seen day order
                              const days = []; const byDay = {};
                              real.forEach((e) => { if (!byDay[e.day]) { byDay[e.day] = []; days.push(e.day); } byDay[e.day].push(e); });
                              const rows = [];
                              days.forEach((day) => {
                                const lines = byDay[day];
                                const multi = lines.length > 1;
                                if (multi) rows.push(
                                  <tr key={'sub-' + day} style={{ background: 'hsl(var(--muted) / 0.4)' }}>
                                    <td style={{ padding: '6px 16px 6px 52px', fontWeight: 600, fontSize: 11.5 }}>{day} · {sumHrs(lines)}h total</td>
                                    <td colSpan={9} style={{ padding: '6px 12px', fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{lines.length} jobs</td>
                                  </tr>);
                                lines.forEach((e, k) => rows.push(
                                  <tr key={day + k} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                                    <td style={{ padding: '9px 16px 9px 52px', color: multi ? 'hsl(var(--muted-foreground))' : 'inherit' }}>{multi ? '' : e.day}</td>
                                    <td style={{ padding: '9px 12px', color: e.job.startsWith('FJ') ? 'hsl(var(--primary))' : 'inherit', fontWeight: e.job.startsWith('FJ') ? 500 : 400 }}>{e.job}</td>
                                    <td style={{ padding: '9px 12px', color: 'hsl(var(--muted-foreground))' }}>{e.loc}</td>
                                    <td style={{ padding: '9px 12px' }}><SiteTime time={e.time} zone={siteZoneFor(e.loc)} small /></td>
                                    <td style={{ padding: '9px 12px', color: 'hsl(var(--muted-foreground))' }}>{e.brk}</td>
                                    <td style={{ padding: '9px 12px', fontWeight: 600 }}>{e.hrs}</td>
                                    <td style={{ padding: '9px 12px' }}><TypePill type={e.type} /></td>
                                    <td style={{ padding: '9px 12px' }}><TsPill status={e.status} /></td>
                                    <td style={{ padding: '9px 12px' }}><InvoicePill value={deriveInv(e)} /></td>
                                    <td style={{ padding: '9px 12px' }}><Icon name="more-horizontal" size={16} color="hsl(var(--muted-foreground))" /></td>
                                  </tr>));
                              });
                              empty.forEach((e, k) => rows.push(
                                <tr key={'empty' + k}><td style={{ padding: '9px 16px 9px 52px', color: 'hsl(var(--muted-foreground))' }}>{e.day}</td><td colSpan={9} style={{ color: 'hsl(var(--muted-foreground))' }}>—</td></tr>));
                              return rows;
                            })()}
                          </tbody>
                        </table>
                      </td>
                    </tr>}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '0 16px 8px' }}><Pagination label="Showing 1 to 4 of 16 technicians" /></div>
        </div>

        <TimesheetDetail sheet={sheet} />
      </div>
    </div>
  );
}

function TsSummaryRow({ k, v }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
    <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}</span><span style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{v}</span></div>;
}
function HealthCheck({ ok, label }) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '6px 0', fontSize: 12.5 }}>
    <Icon name={ok ? 'check-circle-2' : 'alert-triangle'} size={15} color="hsl(var(--muted-foreground))" style={{ marginTop: 1, flexShrink: 0 }} />
    <span style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span></div>;
}
function TimesheetDetail({ sheet: s }) {
  const noSheet = s.status === 'No Timesheet';
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Timesheet Details</h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><TsPill status={s.status} /><ReadOnlyTag /></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '11px 0' }}>
          <Avatar name={s.tech} size={38} />
          <div><div style={{ fontSize: 16, fontWeight: 700 }}>{s.tech}</div><div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}><IdChip id={s.usr} /><span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Week: {s.week || '—'}</span></div></div>
        </div>
        {noSheet ? <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', padding: '8px 0' }}>No timesheet submitted for this week.</div> : <>
          <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid hsl(var(--border))', margin: '0 -15px', padding: '0 15px' }}>
            {[`Summary`, `Entries (${s.entries.length})`, 'Breaks', 'Notes'].map((l, i) =>
              <span key={i} style={{ fontSize: 12.5, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', borderBottom: i === 0 ? '2px solid hsl(var(--primary))' : '2px solid transparent', paddingBottom: 9, cursor: 'pointer' }}>{l}</span>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10 }}><span style={{ fontSize: 12.5, fontWeight: 600 }}>Summary</span><PreviewPill /></div>
          <div style={{ paddingTop: 4 }}>
            <TsSummaryRow k="Total Hours" v={`${s.total} hrs`} />
            <TsSummaryRow k="Billable Hours" v={`${s.billable} hrs (${s.billablePct}%)`} />
            <TsSummaryRow k="Non-Billable Hours" v={`${s.nonBillable} hrs (${s.nonBillablePct}%)`} />
            <TsSummaryRow k="Overtime Hours" v={`${s.overtime} hrs`} />
            <TsSummaryRow k="Standard Hours" v={`${s.standard} hrs`} />
            <TsSummaryRow k="Breaks" v={`${s.breaks} hr`} />
          </div>
          <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 8, paddingTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Approver</span>
              <span style={{ fontSize: 12.5, color: 'hsl(var(--primary))', fontWeight: 500, cursor: 'pointer' }}>Request Changes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}><Avatar name="John Manager" size={22} /><span style={{ fontSize: 13, fontWeight: 500 }}>John Manager</span></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 13 }}>
            <Button variant="primary" icon="check" style={{ flex: 1, justifyContent: 'center', background: 'hsl(var(--success))' }}>Approve</Button>
            <Button variant="destructive" icon="x" style={{ flex: 1, justifyContent: 'center' }}>Reject</Button>
          </div>
        </>}
      </Panel>

      {/* roadmap: entry allocation, labour type, clock source */}
      {!noSheet && <Panel title="Entry Detail" action={<UpcomingPill />}>
        <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 10 }}>Selected: <span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>{(s.entries.find((e) => e.job.startsWith('FJ')) || {}).job || 'FJ-001052 – CCTV Upgrade'}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Clock source</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.6)', border: '1px solid hsl(var(--border))', padding: '2px 9px', borderRadius: 999 }}><Icon name="smartphone" size={12} />Auto-captured</span>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 5 }}>Labour Type</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 38, border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '0 11px', fontSize: 13, background: 'hsl(var(--muted) / 0.45)', color: 'hsl(var(--muted-foreground))' }}><span>Billable — Installation</span><Icon name="chevron-down" size={15} /></div>
        </div>
        <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>Cost-centre allocation — split hours</div>
        {[['CC-000045', 'Electrical', '5.0'], ['CC-000046', 'CCTV', '3.5']].map(([cc, name, hrs], i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'hsl(var(--muted-foreground))', flex: 1, border: '1px solid hsl(var(--input))', borderRadius: 7, padding: '6px 9px', background: 'hsl(var(--muted) / 0.45)' }}><Icon name="lock" size={10} />{cc}<span style={{ fontFamily: 'var(--font-sans)' }}>· {name}</span></span>
            <span style={{ width: 56, textAlign: 'right', fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--input))', borderRadius: 7, padding: '6px 9px', background: 'hsl(var(--muted) / 0.45)' }}>{hrs}h</span></div>)}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500, marginTop: 2 }}><Icon name="plus" size={13} />Add cost centre</div>
      </Panel>}

      <Panel title="Quick Actions">
        {[['plus-circle', 'Add Time Entry'], ['coffee', 'Add Break'], ['message-square-plus', 'Add Note'], ['upload', 'Upload Receipt / File'], ['copy', 'Copy Last Week'], ['user', 'View Technician Profile']].map(([ic, l], i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 11px', marginBottom: 7, fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--primary-subtle))'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={ic} size={14} />{l}</span><Icon name="arrow-right" size={14} /></div>)}
      </Panel>

      <Panel title="Timesheet Health" action={<UpcomingPill />}>
        <HealthCheck ok label="All entries have start and end times" />
        <HealthCheck ok label="Breaks are within allowed limits" />
        <HealthCheck ok={false} label="1 entry exceeds 10 hours" />
        <HealthCheck ok label="No overlapping time entries" />
        <HealthCheck ok={false} label="1 non-billable entry – review notes" />
      </Panel>
    </div>
  );
}

Object.assign(window, { TimesheetsScreen });
