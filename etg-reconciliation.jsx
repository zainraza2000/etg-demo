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
  const [tab, setTab] = useStateRc('Pending Verification');
  const row = RECON_ROWS.find((r) => r.id === selected);
  return (
    <div>
      <PageHeader title="Procurement & Financial Reconciliation" description="Both bank transaction AND supplier invoice must match and be manually verified before approval"
        actions={<>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="landmark">Bank Feed</Button><UpcomingPill /></span>
          <Button variant="outline" icon="upload">Import Invoice</Button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="primary" icon="plus">New Adjustment</Button><UpcomingPill /></span>
        </>} />
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {RECON_KPIS.map((k, i) => <RcKpiCard key={i} {...k} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid hsl(var(--border))', marginBottom: 14, flexWrap: 'wrap' }}>
        {RECON_TABS.map(([label, count]) => {
          const on = label === tab;
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
              {RECON_ROWS.map((r) => {
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
          <div style={{ padding: '0 14px 8px' }}><Pagination label="Showing 1 to 8 of 18 items" /></div>
        </div>

        <ReconDetail row={row} />
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
          <ImpactRow icon="receipt" label="Affects Invoice Readiness" value="6 projects blocked" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="dollar-sign" label="Uninvoiced Costs at Risk" value="$34,280.75" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="trending-down" label="Projects Over Budget (Est.)" value="7 projects" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="alert-triangle" label="Margin at Risk" value="$27,430.25" color="hsl(var(--muted-foreground))" />
          <div style={{ marginTop: 6, color: 'hsl(var(--muted-foreground))', fontSize: 12.5, fontWeight: 500, textAlign: 'right' }}>View affected projects</div>
        </Panel>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'hsl(var(--info-subtle))', border: '1px solid hsl(var(--info) / 0.3)', borderRadius: 10, padding: '12px 16px', marginTop: 16, fontSize: 13 }}>
        <Icon name="info" size={17} color="hsl(var(--info))" /><span><b>Important:</b> No supplier cost will be considered valid until BOTH the bank transaction and supplier invoice are verified and approved by a manager.</span>
      </div>
    </div>
  );
}

function ImpactRow({ icon, label, value, color }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={icon} size={15} color={color} />{label}</span><span style={{ fontWeight: 700, color }}>{value}</span></div>;
}
function SoT({ heading, icon, rows, accent }) {
  return <div style={{ border: '1px solid hsl(var(--border))', borderRadius: 9, padding: 12, flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}><Icon name={icon} size={15} color={accent} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>{heading}</span></div>
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
const RECON_REAL_GATES = ['Bank transaction exists', 'Invoice exists', 'Amounts match', 'Supplier verified'];

function ReconDetail({ row: r }) {
  const matched = r.bankAmt === r.invAmt;
  const doneCount = RECON_CHECKLIST.filter(([, s]) => s === 'done').length;
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Verification</h3><RcPill status={r.status} />
        </div>
        <div style={{ marginBottom: 11 }}><IdChip id={r.im} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SoT heading="Bank Transaction" icon="landmark" accent="hsl(var(--info))" rows={[['Date', r.bankDate], ['Amount', r.bankAmt, true], ['Reference', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.bankRef}</span></span>], ['Account', r.bankAcct]]} />
          <SoT heading="Supplier Invoice" icon="file-text" accent="hsl(var(--success))" rows={[['Invoice', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.si}</span></span>], ['Subtotal', r.invSub], ['GST', r.invGst], ['Total', r.invAmt, true]]} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, margin: '11px 0', padding: '8px 10px', borderRadius: 8,
          background: matched ? 'hsl(var(--success-subtle))' : 'hsl(var(--destructive-subtle))', border: `1px solid ${matched ? 'hsl(var(--success) / 0.3)' : 'hsl(var(--destructive) / 0.3)'}` }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={matched ? 'check-circle-2' : 'alert-triangle'} size={16} color={matched ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: matched ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>{matched ? 'Amounts match' : `Amount mismatch — ${r.bankAmt} vs ${r.invAmt}`}</span></span>
          <ReadOnlyTag />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Verification Checklist</span>
          <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>{doneCount}/{RECON_CHECKLIST.length} complete</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
          {RECON_CHECKLIST.map(([label, state], i) => <CheckItem key={i} label={label} state={state} upcoming={!RECON_REAL_GATES.includes(label)} />)}
        </div>
        <div style={{ display: 'flex', gap: 9, marginTop: 13 }}>
          <Button variant="primary" icon="check" style={{ flex: 1, justifyContent: 'center', background: 'hsl(var(--success))' }}>Verify</Button>
          <Button variant="outline" icon="flag" style={{ flex: 1, justifyContent: 'center' }}>Exception</Button>
        </div>
      </Panel>

      <Panel pad={15}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 9 }}>Allocation</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>Project</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '8px 11px', fontSize: 13 }}><span style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{r.project}</span><Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" /></div></div>
          <div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>Cost Centre</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '8px 11px', fontSize: 13 }}><span style={{ fontFamily: 'var(--font-mono)' }}>{r.cc !== '—' ? r.cc : 'Unallocated'}</span><Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" /></div></div>
        </div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 11, paddingTop: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span style={{ fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Cost-rollup impact</span><UpcomingPill compact /></div>
          <ImpactRow icon="percent" label="Margin Impact" value="—" color="hsl(var(--muted-foreground))" />
          <ImpactRow icon="wallet" label="Remaining Budget" value="—" color="hsl(var(--muted-foreground))" />
        </div>
      </Panel>
    </div>
  );
}

Object.assign(window, { ReconciliationScreen });
