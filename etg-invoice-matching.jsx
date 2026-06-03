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
function MtKpiCard({ title, value, sub, icon, color, readOnly, preview, onClick, active }) {
  const clickable = !!onClick;
  return (
    <div onClick={onClick} style={{ background: active ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', border: `1px solid ${active ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`, borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start', cursor: clickable ? 'pointer' : 'default' }}>
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

// ---- main match table: granular 11-column ledger ----
const MT_GRID = '78px 64px minmax(54px,1.2fr) 92px 82px 122px 76px 64px 86px 98px 58px';
function MtSupplierTile({ name }) {
  const ini = (name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return <span style={{ width: 26, height: 20, borderRadius: 5, background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>{ini}</span>;
}
function MtRowActions({ r, onStatus }) {
  const noBank = r.bankAmt === '—'; const noInv = r.invAmt === '—';
  const stop = (e) => e.stopPropagation();
  if (noInv) return <button onClick={stop} style={{ fontSize: 10.5, fontWeight: 600, border: '1px solid hsl(var(--input))', borderRadius: 6, background: 'hsl(var(--card))', color: 'hsl(var(--primary))', padding: '3px 7px', cursor: 'pointer', fontFamily: 'inherit' }}>Request</button>;
  if (noBank) return <button onClick={stop} style={{ fontSize: 10.5, fontWeight: 600, border: '1px solid hsl(var(--input))', borderRadius: 6, background: 'hsl(var(--card))', color: 'hsl(var(--primary))', padding: '3px 7px', cursor: 'pointer', fontFamily: 'inherit' }}>Find</button>;
  return <span style={{ display: 'inline-flex', gap: 5, color: 'hsl(var(--muted-foreground))' }} onClick={stop}>
    <Icon name="eye" size={14} /><Icon name="pencil" size={14} /><Icon name="more-horizontal" size={14} /></span>;
}
const mtTh = { padding: '8px 10px', fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 };
const mtTd = { padding: '11px 10px', fontSize: 12, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' };

function InvoiceMatchingScreen() {
  const [selected, setSelected] = useStateMt('m1');
  const [tab, setTab] = useStateMt('All');
  const [view, setView] = useStateMt('table');
  const [statusOv, setStatusOv] = useStateMt({});
  const [search, setSearch] = useStateMt('');
  const [fConf, setFConf] = useStateMt('All');
  const [fSupplier, setFSupplier] = useStateMt('All');
  const [fAccount, setFAccount] = useStateMt('All');
  const [rowsPer, setRowsPer] = useStateMt('8');
  const confBand = (c) => c == null ? null : c >= 95 ? '95–100% strong' : c >= 80 ? '80–94% review' : c >= 60 ? '60–79% weak' : 'Below 60% exception';
  const rows0all = MATCH_ROWS.map((r) => statusOv[r.id] ? { ...r, status: statusOv[r.id] } : r);
  const rows0 = rows0all.filter((r) => {
    if (search) { const q = search.toLowerCase(); if (!(`${r.supplier} ${r.bankRef} ${r.inv} ${r.bankAmt} ${r.invAmt} ${r.im}`.toLowerCase().includes(q))) return false; }
    if (fConf !== 'All' && confBand(r.conf) !== fConf) return false;
    if (fSupplier !== 'All' && r.supplier !== fSupplier) return false;
    if (fAccount !== 'All' && r.account !== fAccount) return false;
    return true;
  });
  const tabMatch = { All: () => true, 'Unmatched Bank': (r) => r.status === 'Unmatched Bank', 'Unmatched Invoices': (r) => r.status === 'Unmatched Invoice',
    'Potential Matches': (r) => r.status === 'Potential Match', 'Pending Review': (r) => r.status === 'Pending Review', 'Exceptions': (r) => r.status === 'Exception', 'Matched': (r) => r.status === 'Matched',
    'Ready for Reconciliation': (r) => r.status === 'Ready for Reconciliation', 'Match Rejected': (r) => r.status === 'Match Rejected' };
  const KPI_FILTER = ['Unmatched Bank', 'Unmatched Invoices', 'Potential Matches', 'Pending Review', 'Exceptions', 'Matched'];
  const rows = rows0.filter(tabMatch[tab] || (() => true));
  const PER = parseInt(rowsPer, 10);
  const [page, setPage] = useStateMt(1);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const pg = Math.min(page, pages);
  const visible = rows.slice((pg - 1) * PER, pg * PER);
  const row = rows0all.find((r) => r.id === selected);
  const setStatus = (id, s) => setStatusOv((m) => ({ ...m, [id]: s }));
  const tabCount = (label) => rows0.filter(tabMatch[label] || (() => true)).length;
  const selectTab = (t) => { setTab(t); setPage(1); };
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
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14 }}>
        {MATCH_KPIS.map((k, i) => { const f = KPI_FILTER[i]; return <MtKpiCard key={i} {...k} active={tab === f} onClick={() => selectTab(tab === f ? 'All' : f)} />; })}
        <MtKpiCard title="Missing Invoices" value="13" sub="Request Sent · $18,240.10" icon="file-x" color="red" preview />
      </div>

      {/* toolbar: search + 5 filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Search bank reference, supplier, amount..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        <Select label="Match Confidence" value={fConf} options={['All', '95–100% strong', '80–94% review', '60–79% weak', 'Below 60% exception']} onChange={(v) => { setFConf(v); setPage(1); }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Select label="Date Range" value="This Month" options={['This Month', 'Last Month', 'This Quarter', 'Custom…']} onChange={() => {}} /><UpcomingPill /></span>
        <Select label="Supplier" value={fSupplier} options={['All', ...Array.from(new Set(MATCH_ROWS.map((r) => r.supplier)))]} onChange={(v) => { setFSupplier(v); setPage(1); }} />
        <Select label="Account" value={fAccount} options={['All', ...Array.from(new Set(MATCH_ROWS.map((r) => r.account).filter((a) => a && a !== '—')))]} onChange={(v) => { setFAccount(v); setPage(1); }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Select label="More Filters" options={['Has exception', 'Missing invoice', 'OCR low confidence', 'Duplicate risk']} onChange={() => {}} /><UpcomingPill /></span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, borderBottom: '1px solid hsl(var(--border))', marginBottom: 14, flexWrap: 'wrap' }}>
        {MATCH_TABS.map(([label]) => {
          const on = label === tab; const count = tabCount(label);
          return <button key={label} onClick={() => selectTab(label)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 600 : 500,
            color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', borderBottom: on ? '2px solid hsl(var(--primary))' : '2px solid transparent', padding: '8px 11px', marginBottom: -1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {label}<span style={{ background: on ? 'hsl(var(--primary-subtle))' : 'hsl(var(--muted))', color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 700, padding: '0 6px', borderRadius: 999 }}>{count}</span></button>;
        })}
        <div style={{ marginLeft: 'auto', display: 'inline-flex', border: '1px solid hsl(var(--input))', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
          <button onClick={() => setView('table')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: view === 'table' ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', color: view === 'table' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="table" size={15} />Table</button>
          <button onClick={() => setView('kanban')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderLeft: '1px solid hsl(var(--input))', background: view === 'kanban' ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', color: view === 'kanban' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="kanban" size={15} />Kanban</button>
        </div>
      </div>

      {view === 'kanban' ? <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 16, alignItems: 'start' }}>
        <MatchKanban rows={rows0} onSelect={setSelected} selected={selected} />
        <MatchDetail row={row} onStatus={setStatus} />
      </div> :
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1000 }}>
          {/* band header row */}
          <div style={{ display: 'grid', gridTemplateColumns: MT_GRID, borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)' }}>
            <div style={{ ...mtTh, flexWrap: 'wrap' }}>Status<ReadOnlyTag /></div>
            <div style={{ ...mtTh, gridColumn: '2 / 6', color: 'hsl(var(--info))', borderLeft: '1px solid hsl(var(--border))', flexWrap: 'wrap' }}><Icon name="landmark" size={13} />Bank Transaction <span style={{ fontWeight: 400, fontSize: 10 }}>(Source of Truth #1)</span><PreviewPill /></div>
            <div style={{ ...mtTh, borderLeft: '1px solid hsl(var(--border))' }}>Supplier</div>
            <div style={{ ...mtTh, gridColumn: '7 / 10', color: 'hsl(var(--success))' }}><Icon name="file-text" size={13} />Invoice <span style={{ fontWeight: 400, fontSize: 10 }}>(Source of Truth #2)</span></div>
            <div style={{ ...mtTh, borderLeft: '1px solid hsl(var(--border))', flexWrap: 'wrap' }}>Match Details<ReadOnlyTag /></div>
            <div style={{ ...mtTh }}>Actions</div>
          </div>
          {/* sub-header row */}
          <div style={{ display: 'grid', gridTemplateColumns: MT_GRID, borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.25)' }}>
            <div style={{ ...mtTh, fontSize: 10 }} />
            <div style={{ ...mtTh, fontSize: 10 }}>Date</div>
            <div style={{ ...mtTh, fontSize: 10 }}>Description / Ref</div>
            <div style={{ ...mtTh, fontSize: 10 }}>Account</div>
            <div style={{ ...mtTh, fontSize: 10, justifyContent: 'flex-end' }}>Amount</div>
            <div style={{ ...mtTh, fontSize: 10 }} />
            <div style={{ ...mtTh, fontSize: 10 }}>Invoice #</div>
            <div style={{ ...mtTh, fontSize: 10 }}>Date</div>
            <div style={{ ...mtTh, fontSize: 10, justifyContent: 'flex-end' }}>Amount</div>
            <div style={{ ...mtTh, fontSize: 10 }} />
            <div style={{ ...mtTh, fontSize: 10 }} />
          </div>
          {rows.length === 0 && <div style={{ padding: '26px 12px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>No items in this tab.</div>}
          {visible.map((r) => {
            const isSel = selected === r.id;
            const noBank = r.bankAmt === '—'; const noInv = r.invAmt === '—';
            return <div key={r.id} onClick={() => setSelected(r.id)} style={{ display: 'grid', gridTemplateColumns: MT_GRID, borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent', alignItems: 'stretch' }}>
              {/* 1 status */}
              <div style={{ ...mtTd }}><MtPill status={r.status} />{r.exType && <ExTypeChip type={r.exType} />}{r.reason && <div style={{ fontSize: 9.5, color: 'hsl(var(--destructive))', marginTop: 3, lineHeight: 1.3 }}>{r.reason}</div>}</div>
              {/* 2-5 bank (or collapse) */}
              {noBank ? <div style={{ ...mtTd, gridColumn: '2 / 6', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic', opacity: 0.7 }}>No bank transaction</div> : <>
                <div style={{ ...mtTd, color: 'hsl(var(--muted-foreground))' }}>{r.bankDate}</div>
                <div style={{ ...mtTd, minWidth: 0 }}><span style={{ fontWeight: 600, color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.bankDesc}</span><span style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={9} /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.bankRef}</span></span></div>
                <div style={{ ...mtTd, color: 'hsl(var(--muted-foreground))', fontSize: 11 }}>{r.account}</div>
                <div style={{ ...mtTd, alignItems: 'flex-end', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>{r.bankAmt}</div>
              </>}
              {/* 6 supplier */}
              <div style={{ ...mtTd, flexDirection: 'row', alignItems: 'center', gap: 7 }}><MtSupplierTile name={r.supplier} /><span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.supplier}</span></div>
              {/* 7-9 invoice (or collapse) */}
              {noInv ? <div style={{ ...mtTd, gridColumn: '7 / 10', color: 'hsl(var(--muted-foreground))', fontStyle: 'italic', opacity: 0.7 }}>No invoice — {r.action === 'request' ? 'request from supplier' : 'awaiting'}</div> : <>
                <div style={{ ...mtTd, color: 'hsl(var(--primary))', fontWeight: 600 }}>{r.inv}</div>
                <div style={{ ...mtTd, color: 'hsl(var(--muted-foreground))' }}>{r.invDate}</div>
                <div style={{ ...mtTd, alignItems: 'flex-end', fontWeight: 700, color: r.mismatch ? 'hsl(var(--destructive))' : 'inherit' }}>{r.invAmt}{r.split && <span style={{ fontSize: 9.5, fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>Split · 2</span>}{r.partial && <span style={{ fontSize: 9.5, fontWeight: 500, color: 'hsl(var(--warning))' }}>Partial</span>}</div>
              </>}
              {/* 10 match */}
              <div style={{ ...mtTd }}><MtConf conf={r.conf} /></div>
              {/* 11 actions */}
              <div style={{ ...mtTd, flexDirection: 'row', alignItems: 'center' }}><MtRowActions r={r} onStatus={setStatus} /></div>
            </div>;
          })}
          </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 14px 8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Rows:</span><Select label="Rows" value={rowsPer} options={['8', '10', '25', '50']} onChange={(v) => { setRowsPer(v); setPage(1); }} /></span>
            <div style={{ flex: 1 }}><Pagination label={`Showing ${rows.length === 0 ? 0 : (pg - 1) * PER + 1} to ${Math.min(pg * PER, rows.length)} of ${rows.length} items`} page={pg} pages={pages} onPage={setPage} /></div>
          </div>
        </div>

        <MatchDetail row={row} onStatus={setStatus} />
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Panel title="Request Invoice from Supplier" action={<UpcomingPill />}>
          <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: -4, marginBottom: 10 }}>Send an automated email to request a missing invoice. Pre-fill from bank transaction:</div>
          {[['Supplier', row ? row.supplier : 'Bunnings Warehouse'], ['Email', 'accounts.payable@bunnings.com.au', true], ['Bank Reference', row ? row.bankRef : 'CARD 4512', false, true], ['Transaction Date', row ? row.bankDate : '15 May 2026'], ['Amount (Inc GST)', row ? (row.bankAmt !== '—' ? row.bankAmt : '$326.80') : '$326.80']].map(([k, v, link, mono], i) =>
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', fontSize: 12.5, borderBottom: i < 4 ? '1px solid hsl(var(--border))' : 'none' }}>
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}</span>
              <span style={{ fontWeight: 500, color: link ? 'hsl(var(--primary))' : 'inherit', fontFamily: mono ? 'var(--font-mono)' : 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{mono && <Icon name="lock" size={10} color="hsl(var(--muted-foreground))" />}{v}</span></div>)}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 11 }}><Button variant="primary" icon="mail">Request Invoice</Button></div>
        </Panel>
        <Panel title="Recent Activity">
          {MATCH_ACTIVITY.map(([label, time, ic, c], i) => <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: i < MATCH_ACTIVITY.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
            <Icon name={ic} size={15} color={c} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 12.5 }}>{label}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{time} <span style={{ fontWeight: 500 }}>· Brisbane time</span></div></div></div>)}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
        <Panel title="Matching Rules" action={<span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Auto-match criteria</span>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '2px 18px' }}>
            {MATCH_RULES.map((rule, i) => <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 12.5, alignItems: 'flex-start' }}>
              <Icon name="check" size={14} color="hsl(var(--success))" style={{ marginTop: 2, flexShrink: 0 }} />{rule}</div>)}
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Confidence: 95–100% strong · 80–94% review · 60–79% weak · &lt;60% exception. Manual confirmation always required.</div>
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
function MatchKanban({ rows, onSelect, selected }) {
  const cols = ['Unmatched Bank', 'Potential Match', 'Pending Review', 'Exception', 'Matched'];
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 12, alignItems: 'start' }}>
    {cols.map((c) => { const items = rows.filter((r) => r.status === c);
      return <div key={c} style={{ background: 'hsl(var(--muted) / 0.35)', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 10, minHeight: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}><MtPill status={c} /><span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>{items.length}</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((r) => <div key={r.id} onClick={() => onSelect(r.id)} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: 9, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>{r.supplier}</div>
            <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))', margin: '2px 0' }}>{r.im}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontSize: 12, fontWeight: 700 }}>{r.invAmt !== '—' ? r.invAmt : r.bankAmt}</span><MtConf conf={r.conf} /></div>
          </div>)}
          {items.length === 0 && <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', textAlign: 'center', padding: '8px 0' }}>—</div>}
        </div>
      </div>; })}
  </div>;
}
function MatchDetail({ row: r, onStatus }) {
  const noBank = r.bankAmt === '—'; const noInv = r.invAmt === '—';
  const canConfirm = !noBank && !noInv;
  const needsOverride = r.mismatch || r.status === 'Exception';
  const [splitMsg, setSplitMsg] = React.useState(false);
  const [dtab, setDtab] = React.useState('Match Overview');
  React.useEffect(() => { setSplitMsg(false); setDtab('Match Overview'); }, [r.id]);
  const poFound = canConfirm && !r.mismatch;
  const oA = dtab === 'Match Overview', oBank = oA || dtab === 'Bank Transaction', oSup = oA || dtab === 'Supplier Invoice', oHist = dtab === 'History';
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Match Review</h3><MtPill status={r.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <IdChip id={r.im} />
          {r.reason && <span style={{ fontSize: 11, color: 'hsl(var(--destructive))', fontWeight: 500 }}>{r.reason}</span>}
        </div>
        <div style={{ display: 'flex', gap: 13, borderBottom: '1px solid hsl(var(--border))', margin: '0 -15px 12px', padding: '0 15px', overflowX: 'auto' }}>
          {['Match Overview', 'Bank Transaction', 'Supplier Invoice', 'History'].map((tb) => { const on = dtab === tb;
            return <button key={tb} onClick={() => setDtab(tb)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 12, fontWeight: on ? 600 : 500, whiteSpace: 'nowrap', cursor: 'pointer', color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', borderBottom: on ? '2px solid hsl(var(--primary))' : '2px solid transparent', padding: '0 0 9px', marginBottom: -1 }}>{tb}</button>; })}
        </div>
        {oHist && <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[['file-text', 'Invoice uploaded', '15 May 2026 03:22 PM'], ['wand-2', 'Auto-matched by engine', '16 May 2026 09:15 AM'], ['user-check', 'Sent to manual review', '16 May 2026 10:02 AM'], ['shield-check', 'Matched By: System', '—']].map(([ic, l, tm], i) =>
            <div key={i} style={{ display: 'flex', gap: 9, padding: '7px 0', borderBottom: i < 3 ? '1px solid hsl(var(--border))' : 'none' }}><Icon name={ic} size={14} color="hsl(var(--muted-foreground))" style={{ marginTop: 1, flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 12.5 }}>{l}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{tm} <span style={{ fontWeight: 500 }}>· Brisbane time</span></div></div></div>)}
        </div>}
        {!oHist && <React.Fragment>
        {oA && r.conf !== null && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 10px', background: 'hsl(var(--muted) / 0.45)', borderRadius: 8, marginBottom: 11 }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Match confidence</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><MtConf conf={r.conf} /><ReadOnlyTag /></span>
        </div>}
        {oBank && <MtSide heading="Bank Transaction" icon="landmark" accent="hsl(var(--info))" faded={noBank}
          rows={noBank ? [['Status', 'No transaction found']] : [['Description', r.bankDesc], ['Date', r.bankDate], ['Reference', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.bankRef}</span></span>], ['Account', r.account], ['Amount', r.bankAmt, true]]} />}
        {oA && <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <span style={{ width: 30, height: 30, borderRadius: '50%', background: canConfirm ? (r.mismatch ? 'hsl(var(--destructive-subtle))' : 'hsl(var(--success-subtle))') : 'hsl(var(--muted))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={r.mismatch ? 'alert-triangle' : canConfirm ? 'arrow-up-down' : 'help-circle'} size={15} color={r.mismatch ? 'hsl(var(--destructive))' : canConfirm ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'} /></span>
        </div>}
        {oSup && <MtSide heading="Supplier Invoice" icon="file-text" accent="hsl(var(--success))" faded={noInv}
          rows={noInv ? [['Status', 'No invoice attached']] : [
            ['Supplier', r.supplier],
            ['Invoice #', r.inv],
            ['SupplierInvoice', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="lock" size={10} color="hsl(var(--muted-foreground))" /><span style={{ fontFamily: 'var(--font-mono)' }}>{r.si}</span></span>],
            ['Date', r.invDate],
            ['Subtotal', r.invSub],
            ['GST', r.invGst],
            ['Total', r.invAmt, true],
          ]} />}
        {oSup && !noInv && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
          <Icon name="scan-line" size={13} />Extracted by OCR · <span style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>Edit extracted data</span><UpcomingPill /></div>}

        {oA && r.gstMismatch && <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'hsl(var(--warning-subtle))', border: '1px solid hsl(var(--warning) / 0.3)', borderRadius: 8, padding: '8px 11px', fontSize: 12, color: 'hsl(var(--warning))', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="percent" size={15} />GST mismatch — invoice GST ≠ 10% of subtotal</span><ReadOnlyTag /></div>}
        {oSup && !noInv && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 9, padding: '7px 10px', background: 'hsl(var(--muted) / 0.45)', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="scan-line" size={13} />OCR confidence</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>—</span><ReadOnlyTag /></span></div>}

        {oA && r.mismatch && <div style={{ marginTop: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'hsl(var(--destructive-subtle))', border: '1px solid hsl(var(--destructive) / 0.3)', borderRadius: 8, padding: '8px 11px', fontSize: 12, color: 'hsl(var(--destructive))', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="alert-triangle" size={15} />Amount mismatch — {r.bankAmt} vs {r.invAmt}</span><ReadOnlyTag /></div>}

        {oA && <React.Fragment>
        {/* ===== Bank Match / Job-PO Match split ===== */}
        {canConfirm && <div style={{ marginTop: 12, border: '1px solid hsl(var(--border))', borderRadius: 9, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '10px 12px', borderRight: '1px solid hsl(var(--border))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}><Icon name="landmark" size={13} color="hsl(var(--info))" /><span style={{ fontSize: 12, fontWeight: 700 }}>Bank Match</span></div>
              {['Supplier matched', 'Amount matched', 'Date matched', 'Reference matched'].map((l, i) =>
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', fontSize: 11.5 }}><Icon name="check-circle-2" size={12} color="hsl(var(--success))" />{l}</div>)}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}><Icon name="briefcase" size={13} color={poFound ? 'hsl(var(--success))' : 'hsl(var(--warning))'} /><span style={{ fontSize: 12, fontWeight: 700 }}>Job / PO Match</span></div>
              {poFound ? <React.Fragment>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}><IdChip id="PO-001256" /></div>
                <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}><span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>FJ-001052</span> — CCTV Upgrade · ABC Corporate — Level 1</div>
                {[['PO extracted', true], ['Job found', true], ['Site / customer matched', true], ['Line items assigned', true], ['Cost added to job costing', false]].map(([l, ok], i) =>
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '2px 0', fontSize: 11.5 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name={ok ? 'check-circle-2' : 'circle'} size={12} color={ok ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'} />{l}</span>{!ok && <UpcomingPill compact />}</div>)}
              </React.Fragment> : <React.Fragment>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--warning))', marginBottom: 7 }}><Icon name="alert-triangle" size={12} />PO missing — job link required</div>
                {['Link to existing job', 'Link to project', 'Split across jobs', 'Mark as overhead', 'Send back for review'].map((a, i) =>
                  <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'hsl(var(--primary))', fontWeight: 500, cursor: 'pointer', padding: '3px 0', width: '100%' }}><Icon name="arrow-right" size={11} />{a}</div>)}
              </React.Fragment>}
            </div>
          </div>
        </div>}

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
            <Button variant="primary" icon="check" onClick={() => onStatus && onStatus(r.id, 'Matched')} style={{ flex: 1, justifyContent: 'center', background: 'hsl(var(--success))' }}>{needsOverride ? 'Override & Confirm' : 'Confirm Match'}</Button>
            <Button variant="outline" icon="x" onClick={() => onStatus && onStatus(r.id, 'Match Rejected')} style={{ flex: 1, justifyContent: 'center' }}>Reject</Button>
          </div>}
          {canConfirm && <div style={{ display: 'flex', gap: 9 }}>
            <Button variant="outline" icon="send" onClick={() => onStatus && onStatus(r.id, 'Pending Review')} style={{ flex: 1, justifyContent: 'center' }}>Send to Review</Button>
            <Button variant="outline" icon="git-merge" onClick={() => setSplitMsg((v) => !v)} style={{ flex: 1, justifyContent: 'center', ...(splitMsg ? { background: 'hsl(var(--primary-subtle))', color: 'hsl(var(--primary))' } : {}) }}>Split Allocation</Button>
          </div>}
          {splitMsg && <div style={{ fontSize: 11.5, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: 6, background: 'hsl(var(--primary-subtle))', borderRadius: 7, padding: '7px 10px' }}><Icon name="git-merge" size={13} />Split mode — allocate this amount across multiple jobs / cost centres.</div>}
          <button style={{ border: 'none', background: 'transparent', color: 'hsl(var(--primary))', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>Match to a different invoice →</button>
        </div>
        </React.Fragment>}
        </React.Fragment>}
      </Panel>

      {dtab === 'Match Overview' && <React.Fragment>
      <Panel pad={15}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 9 }}>Verification Checklist <span style={{ fontSize: 11, fontWeight: 400, color: 'hsl(var(--muted-foreground))' }}>(Must be completed before approval)</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 14px' }}>
          {[['Bank transaction exists', 'done'], ['Invoice exists', 'done'], ['Amounts match', r.mismatch ? 'pending' : 'done'], ['GST verified', r.gstMismatch ? 'pending' : 'done'], ['Supplier verified', 'done'], ['Line items reviewed', 'pending'], ['Quantities verified', 'pending'], ['Project allocated', 'pending'], ['Cost centre allocated', 'not-started'], ['Duplicate checked', 'done']].map(([label, st], i) => {
            const m = { done: ['check-circle-2', 'hsl(var(--success))'], pending: ['clock', 'hsl(var(--warning))'], 'not-started': ['circle', 'hsl(var(--muted-foreground))'] };
            const [ic, c] = m[st];
            return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', fontSize: 11.5 }}><Icon name={ic} size={13} color={c} style={{ flexShrink: 0 }} />{label}</div>;
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 9, paddingTop: 8, borderTop: '1px solid hsl(var(--border))', fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="check-circle-2" size={12} color="hsl(var(--success))" />Completed</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={12} color="hsl(var(--warning))" />Pending</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="circle" size={12} color="hsl(var(--muted-foreground))" />Not Started</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 9, borderTop: '1px solid hsl(var(--border))', fontSize: 11.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--muted-foreground))' }}>Matched By: System<ReadOnlyTag /></span>
        </div>
        <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 6 }}>Last Checked By: John Manager · <SiteTime time="9:15 AM" zone={VIEWER_ZONE} oneline /> 16 May 2026<ReadOnlyTag /></div>
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
      </React.Fragment>}
    </div>
  );
}

Object.assign(window, { InvoiceMatchingScreen });
