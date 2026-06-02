// ETG Dashboard — Invoice Matching (Bank Feed) screen.
const { useState: useStateMt } = React;

function mtStatusStyle(s) {
  const map = { 'Potential Match': 'active', 'Pending Review': 'warning', 'Unmatched Bank': 'draft', 'Unmatched Invoice': 'draft', 'Exception': 'overdue', 'Matched': 'complete', 'Partial Payment': 'warning', 'Ready for Reconciliation': 'complete', 'Match Rejected': 'overdue' };
  const v = `var(--status-${map[s] || 'draft'})`;
  return { background: `hsl(${v} / 0.13)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.30)` };
}
function MtPill({ status }) {
  return <span style={{ ...mtStatusStyle(status), display: 'inline-flex', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}
function ExTypeChip({ type }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive-subtle))', border: '1px solid hsl(var(--destructive) / 0.25)', padding: '1px 7px', borderRadius: 999, marginTop: 3 }}><Icon name="alert-triangle" size={10} />{type}</span>;
}
function MtConf({ conf }) {
  if (conf === null) return <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>—</span>;
  const c = conf >= 95 ? 'hsl(var(--success))' : conf >= 80 ? 'hsl(var(--info))' : conf >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 54, height: 6, background: 'hsl(var(--muted))', borderRadius: 999 }}><span style={{ display: 'block', height: '100%', width: `${conf}%`, background: c, borderRadius: 999 }} /></span><span style={{ fontSize: 12, fontWeight: 600 }}>{conf}%</span></span>;
}
// KPI card — engine roll-ups (Read-only); bank-feed-dependent tiles are Preview (muted).
function MtKpiCard({ title, value, sub, icon, color, readOnly, preview }) {
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: preview ? 0.6 : 1 }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 4px', letterSpacing: '-0.02em', color: preview ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{value}</div>
        <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>{sub}</div>
        {preview ? <PreviewPill /> : readOnly ? <ReadOnlyTag /> : null}
      </div>
    </div>
  );
}

function InvoiceMatchingScreen() {
  const [selected, setSelected] = useStateMt('m1');
  const [tab, setTab] = useStateMt('All');
  const row = MATCH_ROWS.find((r) => r.id === selected);
  return (
    <div>
      <PageHeader title="Invoice Matching — Bank Feed" description="Match supplier invoices to bank transactions before reconciliation. Auto-matched, never auto-approved."
        actions={<>
          <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="refresh-cw">Sync Bank Feed</Button><UpcomingPill /></span>
            <span style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 5 }}>Last synced — · Provider: pending<PreviewPill /></span>
          </span>
          <Button variant="outline" icon="upload">Upload Invoice</Button>
          <Button variant="primary" icon="wand-2">Run Auto-Match</Button>
        </>} />
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {MATCH_KPIS.map((k, i) => <MtKpiCard key={i} {...k} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid hsl(var(--border))', marginBottom: 14, flexWrap: 'wrap' }}>
        {MATCH_TABS.map(([label, count]) => {
          const on = label === tab;
          return <button key={label} onClick={() => setTab(label)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 600 : 500,
            color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', borderBottom: on ? '2px solid hsl(var(--primary))' : '2px solid transparent', padding: '8px 11px', marginBottom: -1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {label}<span style={{ background: on ? 'hsl(var(--primary-subtle))' : 'hsl(var(--muted))', color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700, padding: '0 6px', borderRadius: 999 }}>{count}</span></button>;
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {/* dual-column header */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 30px 1fr 96px', borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)' }}>
            <div style={{ padding: '9px 12px', fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>Status<ReadOnlyTag /></div>
            <div style={{ padding: '9px 12px', fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--info))', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}><Icon name="landmark" size={13} />Bank Transaction<PreviewPill /></div>
            <div></div>
            <div style={{ padding: '9px 12px', fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="file-text" size={13} />Supplier Invoice</div>
            <div style={{ padding: '9px 12px', fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>Match<ReadOnlyTag /></div>
          </div>
          {MATCH_ROWS.map((r) => {
            const isSel = selected === r.id;
            const noBank = r.bankAmt === '—'; const noInv = r.invAmt === '—';
            return <div key={r.id} onClick={() => setSelected(r.id)} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 30px 1fr 96px', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent', alignItems: 'center' }}>
              <div style={{ padding: '11px 12px' }}><MtPill status={r.status} />{r.exType && <ExTypeChip type={r.exType} />}{r.reason && <div style={{ fontSize: 10, color: 'hsl(var(--destructive))', marginTop: 3, lineHeight: 1.3 }}>{r.reason}</div>}</div>
              <div style={{ padding: '11px 12px', opacity: noBank ? 0.4 : 1 }}>
                {noBank ? <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>No bank transaction</span> : <>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{r.bankDesc}</div>
                  <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={9} /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.bankRef}</span> · {r.bankDate}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: 'hsl(var(--muted-foreground))' }}>{r.bankAmt}</div></>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', color: r.mismatch ? 'hsl(var(--destructive))' : (noBank || noInv) ? 'hsl(var(--muted-foreground))' : 'hsl(var(--success))' }}>
                <Icon name={r.mismatch ? 'alert-triangle' : (noBank || noInv) ? 'help-circle' : 'arrow-left-right'} size={15} /></div>
              <div style={{ padding: '11px 12px', opacity: noInv ? 0.4 : 1 }}>
                {noInv ? <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>No invoice — {r.action === 'request' ? 'request from supplier' : 'awaiting'}</span> : <>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.supplier}</div>
                  <div style={{ fontSize: 11, color: 'hsl(var(--primary))' }}>{r.inv} · {r.invDate}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: r.mismatch ? 'hsl(var(--destructive))' : 'inherit' }}>{r.invAmt}</div>
                  {r.split && <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="git-merge" size={10} />Split match · 2 invoices<PreviewPill /></div>}
                  {r.partial && <div style={{ fontSize: 10, color: 'hsl(var(--warning))', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="circle-dollar-sign" size={10} />Partial — {r.bankAmt} of {r.invAmt}<PreviewPill /></div>}</>}
              </div>
              <div style={{ padding: '11px 12px' }}><MtConf conf={r.conf} /></div>
            </div>;
          })}
          <div style={{ padding: '6px 14px 8px' }}><Pagination label="Showing 1 to 8 of 389 items" /></div>
        </div>

        <MatchDetail row={row} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Panel title="Matching Rules" action={<span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Auto-match criteria</span>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 18px' }}>
            {MATCH_RULES.map((rule, i) => <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 12.5, alignItems: 'flex-start' }}>
              <Icon name="check" size={14} color="hsl(var(--success))" style={{ marginTop: 2, flexShrink: 0 }} />{rule}</div>)}
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Confidence: 95–100% strong · 80–94% review · 60–79% weak · &lt;60% exception. Manual confirmation always required.</div>
        </Panel>
        <Panel title="Recent Activity">
          {MATCH_ACTIVITY.map(([label, time, ic, c], i) => <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < MATCH_ACTIVITY.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
            <Icon name={ic} size={15} color={c} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 12.5 }}>{label}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{time} <span style={{ fontWeight: 500 }}>· Brisbane time</span></div></div></div>)}
        </Panel>
      </div>
    </div>
  );
}

function MtSide({ heading, icon, accent, rows, faded }) {
  return <div style={{ border: '1px solid hsl(var(--border))', borderRadius: 9, padding: 12, opacity: faded ? 0.55 : 1 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}><Icon name={icon} size={14} color={accent} /><span style={{ fontSize: 12, fontWeight: 600 }}>{heading}</span></div>
    {rows.map(([k, v, hl], i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '3px 0', fontSize: 11.5 }}>
      <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}</span><span style={{ fontWeight: hl ? 700 : 500, textAlign: 'right' }}>{v}</span></div>)}
  </div>;
}
function MatchDetail({ row: r }) {
  const noBank = r.bankAmt === '—'; const noInv = r.invAmt === '—';
  const canConfirm = !noBank && !noInv;
  const needsOverride = r.mismatch || r.status === 'Exception';
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Match Review</h3><MtPill status={r.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
          <IdChip id={r.im} />
          {r.reason && <span style={{ fontSize: 11, color: 'hsl(var(--destructive))', fontWeight: 500 }}>{r.reason}</span>}
        </div>
        {r.conf !== null && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', background: 'hsl(var(--muted) / 0.45)', borderRadius: 8, marginBottom: 11 }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Match confidence</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><MtConf conf={r.conf} /><ReadOnlyTag /></span>
        </div>}
        <MtSide heading="Bank Transaction" icon="landmark" accent="hsl(var(--info))" faded={noBank}
          rows={noBank ? [['Status', 'No transaction found']] : [['Description', r.bankDesc], ['Date', r.bankDate], ['Reference', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.bankRef}</span></span>], ['Account', r.account], ['Amount', r.bankAmt, true]]} />
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: canConfirm ? (r.mismatch ? 'hsl(var(--destructive-subtle))' : 'hsl(var(--success-subtle))') : 'hsl(var(--muted))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={r.mismatch ? 'alert-triangle' : canConfirm ? 'arrow-up-down' : 'help-circle'} size={15} color={r.mismatch ? 'hsl(var(--destructive))' : canConfirm ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'} /></span>
        </div>
        <MtSide heading="Supplier Invoice" icon="file-text" accent="hsl(var(--success))" faded={noInv}
          rows={noInv ? [['Status', 'No invoice attached']] : [
            ['Supplier', r.supplier],
            ['Invoice #', r.inv],
            ['SupplierInvoice', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.si}</span></span>],
            ['Date', r.invDate],
            ['Subtotal', r.invSub],
            ['GST', r.invGst],
            ['Total', r.invAmt, true],
          ]} />
        {!noInv && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
          <Icon name="scan-line" size={13} />Extracted by OCR · <span style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>Edit extracted data</span><UpcomingPill /></div>}

        {r.gstMismatch && <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'hsl(var(--warning-subtle))', border: '1px solid hsl(var(--warning) / 0.3)', borderRadius: 8, padding: '8px 11px', fontSize: 12, color: 'hsl(var(--warning))', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="percent" size={15} />GST mismatch — invoice GST ≠ 10% of subtotal</span><ReadOnlyTag /></div>}
        {!noInv && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9, padding: '7px 10px', background: 'hsl(var(--muted) / 0.45)', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="scan-line" size={13} />OCR confidence</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>—</span><ReadOnlyTag /></span></div>}

        {r.mismatch && <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'hsl(var(--destructive-subtle))', border: '1px solid hsl(var(--destructive) / 0.3)', borderRadius: 8, padding: '8px 11px', fontSize: 12, color: 'hsl(var(--destructive))', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="alert-triangle" size={15} />Amount mismatch — {r.bankAmt} vs {r.invAmt}</span><ReadOnlyTag /></div>}

        {/* reviewer note + override */}
        <div style={{ marginTop: 13 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Note {needsOverride ? <span style={{ color: 'hsl(var(--destructive))', fontWeight: 500 }}>· override reason required</span> : <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>(optional)</span>}</div>
          <textarea placeholder={needsOverride ? 'Reason for overriding this match…' : 'Add a note for this decision…'} style={{ width: '100%', height: 52, border: `1px solid ${needsOverride ? 'hsl(var(--destructive) / 0.4)' : 'hsl(var(--input))'}`, borderRadius: 8, padding: 10, boxSizing: 'border-box', fontSize: 12.5, fontFamily: 'inherit', resize: 'none', background: 'hsl(var(--card))' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 11 }}>
          {noInv && <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 5 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="primary" icon="mail" style={{ flex: 1, justifyContent: 'center' }}>Request Invoice from Supplier</Button><UpcomingPill /></span>{r.supplierContactMissing && <span style={{ fontSize: 11, color: 'hsl(var(--warning))', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="alert-triangle" size={12} />Supplier contact missing<PreviewPill /></span>}</span>}
          {r.status === 'Ready for Reconciliation' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="primary" icon="arrow-right" style={{ flex: 1, justifyContent: 'center' }}>Move to Reconciliation</Button><UpcomingPill /></span>}
          {noBank && <Button variant="outline" icon="search" style={{ justifyContent: 'center' }}>Find Matching Transaction</Button>}
          {canConfirm && <div style={{ display: 'flex', gap: 9 }}>
            <Button variant="primary" icon="check" style={{ flex: 1, justifyContent: 'center', background: 'hsl(var(--success))' }}>{needsOverride ? 'Override & Confirm' : 'Confirm Match'}</Button>
            <Button variant="outline" icon="x" style={{ flex: 1, justifyContent: 'center' }}>Reject</Button>
          </div>}
          <button style={{ border: 'none', background: 'transparent', color: 'hsl(var(--primary))', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Match to a different invoice →</button>
        </div>
      </Panel>

      <Panel pad={15}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Why this match?</div>
        {[
          ['Supplier name match', !noBank && !noInv],
          ['Amount within tolerance', !r.mismatch && canConfirm],
          ['Date within 14 days', canConfirm],
          ['Reference / invoice number', r.conf !== null && r.conf >= 80],
        ].map(([label, ok], i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12.5 }}>
            <Icon name={ok ? 'check-circle-2' : 'x-circle'} size={14} color={ok ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />{label}</div>)}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>
          <Icon name="circle-dashed" size={14} color="hsl(var(--muted-foreground))" />No duplicate detected<UpcomingPill /></div>
      </Panel>
    </div>
  );
}

Object.assign(window, { InvoiceMatchingScreen });
