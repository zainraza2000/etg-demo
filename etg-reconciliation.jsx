// ETG Dashboard — Procurement & Financial Reconciliation screen.
const { useState: useStateRc } = React;

function rcStatusStyle(s) {
  const map = { 'Pending Verification': 'warning', 'Potential Match': 'active', 'Exception': 'overdue', 'Verified': 'complete', 'Approved': 'complete' };
  const v = `var(--status-${map[s] || 'draft'})`;
  return { background: `hsl(${v} / 0.13)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.30)` };
}
function RcPill({ status }) {
  return <span style={{ ...rcStatusStyle(status), display: 'inline-flex', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}
function SupplierTile({ name, size = 30 }) {
  const ini = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <span style={{ width: size, height: size, borderRadius: 7, background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>{ini}</span>;
}
function ConfBar({ conf, label }) {
  if (conf === null || conf === 0) return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 64, height: 6, background: 'hsl(var(--destructive) / 0.2)', borderRadius: 999 }}><span style={{ display: 'block', height: '100%', width: '22%', background: 'hsl(var(--destructive))', borderRadius: 999 }} /></span><span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--destructive))' }}>EXCEPTION</span></span>;
  const band = conf >= 95 ? ['STRONG', 'hsl(var(--success))'] : conf >= 80 ? ['LIKELY', 'hsl(var(--info))'] : conf >= 60 ? ['WEAK', 'hsl(var(--warning))'] : ['EXCEPTION', 'hsl(var(--destructive))'];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 64, height: 6, background: 'hsl(var(--muted))', borderRadius: 999 }}><span style={{ display: 'block', height: '100%', width: `${conf}%`, background: band[1], borderRadius: 999 }} /></span><span style={{ fontSize: 12, fontWeight: 600 }}>{conf}%</span><span style={{ fontSize: 9.5, fontWeight: 700, color: band[1] }}>{band[0]}</span></span>;
}
function PriorityDot({ priority }) {
  const c = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[priority];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />{priority}</span>;
}
// KPI card — real tallies whose cost-rollup feed isn't connected (Preview, muted).
function RcKpiCard({ title, value, sub, icon, color }) {
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

function ReconciliationScreen() {
  const [selected, setSelected] = useStateRc('r1');
  const [tab, setTab] = useStateRc('All Items');
  const [statusOv, setStatusOv] = useStateRc({});
  const rows0 = RECON_ROWS.map((r) => statusOv[r.id] ? { ...r, status: statusOv[r.id] } : r);
  const tabMatch = { 'All Items': () => true, 'Potential Matches': (r) => r.status === 'Potential Match',
    'Pending Verification': (r) => r.status === 'Pending Verification', 'Verified': (r) => r.status === 'Verified',
    'Approved': (r) => r.status === 'Approved', 'Exceptions': (r) => r.status === 'Exception',
    'Manager Review': (r) => r.status === 'Manager Review',
    'Unallocated': (r) => r.cc === '—' };
  const rows = rows0.filter(tabMatch[tab] || (() => true));
  const row = rows0.find((r) => r.id === selected);
  const setStatus = (id, s) => setStatusOv((m) => ({ ...m, [id]: s }));
  const tabCount = (label) => RECON_ROWS.map((r) => statusOv[r.id] ? { ...r, status: statusOv[r.id] } : r).filter(tabMatch[label] || (() => true)).length;
  return (
    <div>
      <PageHeader title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>Procurement &amp; Financial Reconciliation <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.7)', border: '1px solid hsl(var(--border))', padding: '2px 9px', borderRadius: 999 }}><Icon name="lock" size={11} />Internal · Finance only</span></span>} description="Both bank transaction AND supplier invoice must match and be manually verified before approval"
        actions={<>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="landmark">Bank Feed</Button><UpcomingPill /></span>
          <Button variant="outline" icon="upload">Import Invoice</Button>
          <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="primary" icon="plus">New Adjustment</Button><UpcomingPill /></span>
            <span style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))' }}>Layered correction — never edits the original</span>
          </span>
        </>} />
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {RECON_KPIS.map((k, i) => <RcKpiCard key={i} {...k} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid hsl(var(--border))', marginBottom: 14, flexWrap: 'wrap' }}>
        {RECON_TABS.map(([label]) => {
          const on = label === tab; const count = tabCount(label);
          return <button key={label} onClick={() => setTab(label)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 600 : 500,
            color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', borderBottom: on ? '2px solid hsl(var(--primary))' : '2px solid transparent', padding: '8px 11px', marginBottom: -1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {label}<span style={{ background: on ? 'hsl(var(--primary-subtle))' : 'hsl(var(--muted))', color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700, padding: '0 6px', borderRadius: 999 }}>{count}</span></button>;
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 920 }}>
            <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}>Status</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}><span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>Priority<UpcomingPill compact /></span></th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}>Match</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}>Bank Transaction</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}>Supplier · Invoice</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}><span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>Match Confidence<ReadOnlyTag /></span></th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}>Project / Cost Centre</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}>Actions</th>
            </tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} style={{ padding: '26px 12px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>No items in this tab.</td></tr>}
              {rows.map((r) => {
                const isSel = selected === r.id;
                return <tr key={r.id} onClick={() => setSelected(r.id)} style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent' }}>
                  <td style={{ padding: '11px 12px' }}><RcPill status={r.status} /></td>
                  <td><PriorityDot priority={r.priority} /></td>
                  <td><IdChip id={r.im} /></td>
                  <td><div style={{ fontWeight: 600 }}>{r.bankAmt}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{r.bankDate} · <Icon name="lock" size={9} /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.bankRef}</span></div></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SupplierTile name={r.supplier} size={26} /><div><div style={{ fontWeight: 500 }}>{r.supplier}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}>{r.si} · {r.invAmt}</div></div></div></td>
                  <td><ConfBar conf={r.conf} label={r.confLabel} /></td>
                  <td><div style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', color: r.project === '—' ? 'hsl(var(--muted-foreground))' : 'inherit' }}>{r.project}{r.cc !== '—' && <span style={{ color: 'hsl(var(--muted-foreground))' }}> · {r.cc}</span>}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{r.site}</div></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))' }}>Review</span><Icon name="more-horizontal" size={16} color="hsl(var(--muted-foreground))" /></div></td>
                </tr>;
              })}
            </tbody>
          </table>
          </div>
          <div style={{ padding: '0 14px 8px' }}><Pagination label={`Showing 1 to ${rows.length} of ${rows.length} items`} page={1} pages={1} onPage={() => {}} /></div>
        </div>

        <ReconDetail row={row} onStatus={setStatus} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
        <Panel title="Exception Summary" action={<PreviewPill />}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            {RECON_EXCEPTIONS.map(([label, n, amt], i) => {
              const total = i === 5;
              return <div key={i} style={{ border: `1px solid ${total ? 'hsl(var(--destructive) / 0.3)' : 'hsl(var(--border))'}`, background: total ? 'hsl(var(--destructive-subtle))' : 'hsl(var(--muted) / 0.4)', borderRadius: 9, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: total ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', margin: '2px 0' }}>{n}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>{amt}</div></div>;
            })}
          </div>
        </Panel>
        <Panel title="Reconciliation Rules" action={<span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>4 enforced · 3 planned</span>}>
          {RECON_RULES.map((rule, i) => <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 12.5, alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'flex-start' }}>
              <Icon name={rule.enforced ? 'check-circle-2' : 'circle-dashed'} size={15} color={rule.enforced ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ color: rule.enforced ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{rule.text}</span></span>
            {rule.enforced
              ? <span style={{ fontSize: 9.5, fontWeight: 700, color: 'hsl(var(--success))', whiteSpace: 'nowrap', marginTop: 2 }}>ENFORCED</span>
              : <span style={{ marginTop: 1 }}><UpcomingPill compact /></span>}</div>)}
        </Panel>
        <Panel title="Approval Impact" action={<UpcomingPill />}>
          <ImpactRow icon="receipt" label="Affects Invoice Readiness" value="—" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="dollar-sign" label="Uninvoiced Costs at Risk" value="—" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="trending-down" label="Projects Over Budget (Est.)" value="—" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="alert-triangle" label="Margin at Risk" value="—" color="hsl(var(--muted-foreground))" />
          <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 8, paddingTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: 5 }}>Invoice-readiness blockers</div>
            {['Unverified supplier costs on PRJ-000142', 'Cost centre not allocated (1 item)', 'Margin below threshold — manager review'].map((b, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '3px 0', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}><Icon name="x-circle" size={13} style={{ flexShrink: 0, marginTop: 1 }} />{b}</div>)}
          </div>
          <div style={{ marginTop: 6, color: 'hsl(var(--muted-foreground))', fontSize: 12.5, fontWeight: 500, textAlign: 'right' }}>View affected projects</div>
        </Panel>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'hsl(var(--info-subtle))', border: '1px solid hsl(var(--info) / 0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16, fontSize: 13 }}>
        <Icon name="info" size={17} color="hsl(var(--info))" /><span><b>Important:</b> No supplier cost is valid until BOTH the bank transaction and supplier invoice exist, match, and are manually verified by an authorised user. Auto-match is allowed, but auto-approval is not. The cost must also be assigned to the correct job, included in job costing, and checked before the customer invoice is finalised — supplier cost → job costing → invoice readiness.</span>
      </div>
    </div>
  );
}

function ImpactRow({ icon, label, value, color }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={icon} size={15} color={color} />{label}</span><span style={{ fontWeight: 700, color }}>{value}</span></div>;
}
function SoT({ heading, icon, rows, accent, tag }) {
  return <div style={{ border: '1px solid hsl(var(--border))', borderRadius: 9, padding: 12, flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}><Icon name={icon} size={15} color={accent} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{heading}</span>{tag && <span style={{ marginLeft: 'auto' }}>{tag}</span>}</div>
    {rows.map(([k, v, hl], i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '3px 0', fontSize: 11.5 }}>
      <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}</span><span style={{ fontWeight: hl ? 700 : 500, textAlign: 'right' }}>{v}</span></div>)}
  </div>;
}
function CheckItem({ label, state, upcoming }) {
  const map = { done: ['check-circle-2', 'hsl(var(--success))'], pending: ['clock', 'hsl(var(--warning))'] };
  const [ic, c] = map[state];
  return <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 11.5, justifyContent: 'space-between' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name={ic} size={13} color={c} style={{ flexShrink: 0 }} /><span style={{ color: upcoming ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{label}</span></span>
    {upcoming && <UpcomingPill compact />}</div>;
}
// the four real gates enforced today; everything else is roadmap
const RECON_REAL_GATES = ['Bank transaction exists', 'Invoice exists', 'Amounts match', 'Manually verified'];

function ReconDetail({ row: r, onStatus }) {
  const matched = r.bankAmt === r.invAmt;
  const jobReady = !r.noPo && r.project !== '—';
  const doneCount = RECON_CHECKLIST.filter(([, s]) => s === 'done').length;
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Match Review</h3><RcPill status={r.status} />
        </div>
        <div style={{ marginBottom: 11 }}><IdChip id={r.im} /></div>

        {/* ===== SECTION 1 — BANK MATCH ===== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <Icon name="landmark" size={14} color="hsl(var(--info))" /><span style={{ fontSize: 12.5, fontWeight: 700 }}>Bank Match</span><ReadOnlyTag compact />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SoT heading="Bank Transaction" icon="landmark" accent="hsl(var(--info))" rows={[['Date', r.bankDate], ['Amount', r.bankAmt, true], ['Reference', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.bankRef}</span></span>], ['Account', r.bankAcct]]} />
          <SoT heading="Supplier Invoice" icon="file-text" accent="hsl(var(--success))" tag={<ReadOnlyTag compact />} rows={[['Invoice', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.si}</span></span>], ['Subtotal', r.invSub], ['GST', r.invGst], ['Total', r.invAmt, true]]} />
        </div>
        {/* OCR extracted fields */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '9px 0 6px', fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
          <Icon name="scan-line" size={12} />Extracted by OCR<span style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>· Edit extracted data</span><UpcomingPill compact />
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>OCR confidence <span style={{ fontWeight: 600 }}>—</span><ReadOnlyTag compact /></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', marginBottom: 9 }}>
          {[['Site / customer ref', true], ['Delivery docket #', true], ['Project reference', true], ['Cost category', false]].map(([l, pv], i) =>
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 6, fontSize: 11, padding: '2px 0' }}>
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>{l}</span>{pv ? <PreviewPill /> : <span style={{ color: 'hsl(var(--muted-foreground))' }}>Materials</span>}</div>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '4px 0 10px', padding: '8px 10px', borderRadius: 8,
          background: matched ? 'hsl(var(--success-subtle))' : 'hsl(var(--destructive-subtle))', border: `1px solid ${matched ? 'hsl(var(--success) / 0.3)' : 'hsl(var(--destructive) / 0.3)'}` }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={matched ? 'check-circle-2' : 'alert-triangle'} size={16} color={matched ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: matched ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>{matched ? 'Amounts match' : `Amount mismatch — ${r.bankAmt} vs ${r.invAmt}`}</span></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px', marginBottom: 4 }}>
          {[['Supplier matched', 'done'], ['Amount matched', matched ? 'done' : 'pending'], ['Date close', 'done'], ['Reference matched', 'pending']].map(([l, s], i) => <CheckItem key={i} label={l} state={s} />)}
        </div>

        {/* ===== SECTION 2 — JOB / PO MATCH (net-new) ===== */}
        <div style={{ borderTop: '1px solid hsl(var(--border))', margin: '12px 0 10px', paddingTop: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
            <Icon name="git-merge" size={14} color="hsl(var(--primary))" /><span style={{ fontSize: 12.5, fontWeight: 700 }}>Job / PO Match</span><ReadOnlyTag compact />
          </div>
          {jobReady ? <>
            <div style={{ background: 'hsl(var(--muted) / 0.45)', borderRadius: 9, padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0', fontSize: 12 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>PO Reference</span><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>PO-001256</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '2px 0', fontSize: 12 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Linked Job</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IdChip id="FJ-001052" /><span>CCTV Upgrade</span></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0', fontSize: 12 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Site / Customer</span><span style={{ fontWeight: 500 }}>ABC Corporate — Level 1</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, marginBottom: 8 }}>
              {[['PO extracted', false], ['Job found', false], ['Site / customer matched', false], ['Line items assigned to job', false], ['Cost added to job costing', true]].map(([l, up], i) =>
                <CheckItem key={i} label={l} state={up ? 'pending' : 'done'} upcoming={up} />)}
            </div>
            {/* line items → job mini-table */}
            <div style={{ border: '1px solid hsl(var(--border))', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'hsl(var(--muted) / 0.4)', fontSize: 10.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}><span>Line items → job</span><PreviewPill /></div>
              {[['8× Dome Camera 8MP', 'CC-000046', 'Materials'], ['Cabling & connectors', 'CC-000046', 'Materials']].map(([l, cc, cat], i) =>
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderTop: '1px solid hsl(var(--border))', fontSize: 11.5 }}>
                  <span style={{ flex: 1 }}>{l}</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'hsl(var(--primary))', background: 'hsl(var(--primary-subtle))', padding: '1px 6px', borderRadius: 999 }}>{cc}</span><span style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))' }}>{cat}</span></div>)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 12, padding: '7px 10px', background: 'hsl(var(--muted) / 0.4)', border: '1px dashed hsl(var(--border))', borderRadius: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--muted-foreground))' }}><Icon name="trending-up" size={13} />+$4,145.45 materials → <span style={{ fontFamily: 'var(--font-mono)' }}>FJ-001052</span></span><UpcomingPill compact />
            </div>
          </> : <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'hsl(var(--destructive-subtle))', border: '1px solid hsl(var(--destructive) / 0.3)', borderRadius: 9, padding: '9px 12px', marginBottom: 9 }}>
              <Icon name="alert-triangle" size={16} color="hsl(var(--destructive))" /><span style={{ fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--destructive))' }}>PO missing — job link required</span><span style={{ marginLeft: 'auto' }}><PreviewPill /></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, marginBottom: 9 }}>
              {['PO extracted', 'Job found', 'Site / customer matched', 'Line items assigned to job', 'Cost added to job costing'].map((l, i) =>
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}><Icon name="x-circle" size={13} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0 }} />{l}</div>)}
            </div>
            <div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', marginBottom: 7 }}>Every resolution is a manual, audited action.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {['Link to existing job', 'Link to project', 'Split across multiple jobs', 'Mark as overhead', 'Send back for review'].map((l, i) =>
                <button key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, border: '1px solid hsl(var(--input))', background: 'hsl(var(--card))', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 500, color: 'hsl(var(--foreground))', gridColumn: i === 4 ? '1 / -1' : 'auto' }}>
                  {l}<Icon name="sparkles" size={11} color="hsl(258 70% 60%)" /></button>)}
            </div>
          </>}
        </div>

        <div style={{ display: 'flex', gap: 9, marginTop: 13 }}>
          <Button variant="primary" icon="check" onClick={() => jobReady && onStatus && onStatus(r.id, 'Verified')} style={{ flex: 1, justifyContent: 'center', background: 'hsl(var(--success))', ...(jobReady ? {} : { opacity: 0.5, pointerEvents: 'none' }) }}>Verify</Button>
          <Button variant="outline" icon="flag" onClick={() => onStatus && onStatus(r.id, 'Exception')} style={{ flex: 1, justifyContent: 'center' }}>Exception</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9, padding: '8px 10px', background: 'hsl(var(--muted) / 0.45)', borderRadius: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}><Icon name="lock" size={13} />Lock into financials<UpcomingPill compact /></span>
          <span title="Pushes the verified cost into project financials &amp; invoice readiness" style={{ fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 7, padding: '3px 10px', cursor: 'not-allowed', opacity: 0.6 }}>Lock</span>
        </div>
      </Panel>

      <Panel pad={15}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 9 }}>Allocation{r.status === 'Manager Review' && <span style={{ marginLeft: 7, ...statusStyle('medium'), padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>Manager Review Required</span>}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>Project</div>
            <Select label="" value={r.project} options={['PRJ-000142', 'PRJ-000144', 'PRJ-000146', 'PRJ-000148', 'Unallocated']} onChange={() => {}} /></div>
          <div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>Cost Centre</div>
            <Select label="" value={r.cc !== '—' ? r.cc : 'Unallocated'} options={['CC-000045', 'CC-000046', 'CC-000049', 'Unallocated']} onChange={() => {}} /></div>
          {/* N-way split allocation (roadmap) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px dashed hsl(var(--border))', borderRadius: 8, padding: '8px 11px', fontSize: 12.5, background: 'hsl(var(--muted) / 0.35)', opacity: 0.7 }}><span style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}>CC-000049 · 40%</span><span style={{ color: 'hsl(var(--muted-foreground))' }}>$232.32</span></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}><Icon name="plus" size={13} />Add split allocation<UpcomingPill compact /></div>
        </div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 11, paddingTop: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span style={{ fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Cost-rollup impact</span><UpcomingPill compact /></div>
          <ImpactRow icon="percent" label="Margin Impact" value="—" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="wallet" label="Remaining Budget" value="—" color="hsl(var(--muted-foreground))" />
        </div>
      </Panel>

      <Panel title="Quoted vs Actual" action={<PreviewPill />}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
          <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            {['Line', 'Quoted', 'Actual', 'Variance'].map((h, i) => <th key={i} style={{ textAlign: i ? 'right' : 'left', fontWeight: 500, color: 'hsl(var(--muted-foreground))', padding: '5px 4px' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {RECON_QVA.map(([l, q, a, v], i) => <tr key={i} style={{ borderBottom: i < RECON_QVA.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
              <td style={{ padding: '5px 4px', color: 'hsl(var(--muted-foreground))' }}>{l}</td>
              <td style={{ padding: '5px 4px', textAlign: 'right', color: 'hsl(var(--muted-foreground))' }}>{q}</td>
              <td style={{ padding: '5px 4px', textAlign: 'right', color: 'hsl(var(--muted-foreground))' }}>{a}</td>
              <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600, color: v.indexOf('+') === 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}>{v}</td></tr>)}
          </tbody>
        </table>
        <div style={{ marginTop: 8, border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 8, padding: '8px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Total variance vs quote</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}><Icon name="loader" size={12} />Calculating…</span></div>
      </Panel>

      <Panel title="Activity / Audit" action={<PreviewPill />}>
        {[['Cost imported from bank feed', 'Accounts · 8:10 AM'], ['OCR extracted invoice total', 'System · 8:11 AM'], ['Allocated to PRJ-000142 / CC-000045', 'J. Manager · 9:02 AM']].map(([a, m], i) =>
          <div key={i} style={{ display: 'flex', gap: 9, padding: '6px 0', borderBottom: i < 2 ? '1px solid hsl(var(--border))' : 'none' }}>
            <Icon name="dot" size={14} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{a}</div><div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))' }}>{m}</div></div></div>)}
      </Panel>
    </div>
  );
}

Object.assign(window, { ReconciliationScreen });
