// ETG Dashboard — Client Assets screen.
const { useState: useStateAs } = React;

const ASSET_ICON = {
  'CCTV Camera': 'cctv', 'CCTV Recorder': 'hard-drive', 'Network Switch': 'network',
  'Access Controller': 'cpu', 'Intrusion Panel': 'shield-alert', 'Intercom': 'phone',
  'UPS': 'battery-charging', 'Access Reader': 'scan-line',
};
function StatusPending() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 9px', borderRadius: 999,
    fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.6)', border: '1px solid hsl(var(--border))' }}>
    —<span style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--muted-foreground) / 0.45)' }} /></span>;
}
function DeviceTile({ type, size = 38 }) {
  return <span style={{ width: size, height: size, borderRadius: 8, background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <Icon name={ASSET_ICON[type] || 'box'} size={size * 0.5} color="hsl(var(--muted-foreground))" /></span>;
}
// KPI card — register counts (Preview, muted); roadmap tiles go Upcoming.
function AsKpiCard({ title, value, sub, icon, color, preview, upcoming }) {
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 4px', letterSpacing: '-0.02em', color: 'hsl(var(--muted-foreground))' }}>{upcoming ? '—' : value}</div>
        <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>{sub}</div>
        {upcoming ? <UpcomingPill /> : <PreviewPill />}
      </div>
    </div>
  );
}

function AssetsScreen() {
  const [selected, setSelected] = useStateAs(ASSETS[0].tag);
  const [search, setSearch] = useStateAs('');
  const [fClient, setFClient] = useStateAs('All');
  const [fSite, setFSite] = useStateAs('All');
  const [fType, setFType] = useStateAs('All');
  const [fCrit, setFCrit] = useStateAs('All');
  const [view, setView] = useStateAs('list');
  const [page, setPage] = useStateAs(1);
  const [sel, setSel] = useStateAs({});
  const PER = 8;
  const clients = ['All', ...Array.from(new Set(ASSETS.map((a) => a.client)))];
  const sites = ['All', ...Array.from(new Set(ASSETS.map((a) => a.site)))];
  const types = ['All', ...Array.from(new Set(ASSETS.map((a) => a.type)))];
  const filtered = ASSETS.filter((a) => {
    if (fClient !== 'All' && a.client !== fClient) return false;
    if (fSite !== 'All' && a.site !== fSite) return false;
    if (fType !== 'All' && a.type !== fType) return false;
    if (fCrit !== 'All' && a.criticality !== fCrit) return false;
    if (search) { const q = search.toLowerCase(); const hay = `${a.name} ${a.eg} ${a.type} ${a.serial} ${a.ip} ${a.loc} ${a.client} ${a.site}`.toLowerCase(); if (!hay.includes(q)) return false; }
    return true;
  });
  const asset = ASSETS.find((a) => a.tag === selected) || filtered[0] || ASSETS[0];
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const pg = Math.min(page, pages);
  const visible = filtered.slice((pg - 1) * PER, pg * PER);
  const selCount = Object.values(sel).filter(Boolean).length;
  const allOnPage = visible.length > 0 && visible.every((a) => sel[a.tag]);
  const toggleAll = () => { const next = { ...sel }; if (allOnPage) visible.forEach((a) => delete next[a.tag]); else visible.forEach((a) => next[a.tag] = true); setSel(next); };
  const toggleOne = (tag) => setSel((m) => ({ ...m, [tag]: !m[tag] }));
  return (
    <div>
      <PageHeader title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>Client Assets <PreviewPill /></span>} description="All client assets and equipment — asset monitoring & health is rolling out"
        actions={<>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="download">Export</Button><UpcomingPill /></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="upload">Import Assets</Button><UpcomingPill /></span>
          <Button variant="primary" icon="plus">Add Asset</Button>
        </>} />
      <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {ASSET_KPIS.map((k, i) => <AsKpiCard key={i} {...k} />)}
      </div>
      <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {ASSET_KPIS2.map((k, i) => <AsKpiCard key={i} {...k} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Search assets by name, type, serial, IP, location..." value={search} onChange={setSearch} />
        <Select label="Client" value={fClient} options={clients} onChange={setFClient} />
        <Select label="Site" value={fSite} options={sites} onChange={setFSite} />
        <Select label="Type" value={fType} options={types} onChange={setFType} />
        <Select label="Criticality" value={fCrit} options={['All', 'High', 'Medium', 'Low']} onChange={setFCrit} />
        <AssetMoreFilters />
        <div style={{ marginLeft: 'auto', display: 'inline-flex', border: '1px solid hsl(var(--input))', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setView('list')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: view === 'list' ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', color: view === 'list' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="list" size={15} />List View</button>
          <button onClick={() => setView('map')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderLeft: '1px solid hsl(var(--input))', background: view === 'map' ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', color: view === 'map' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '8px 11px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="map" size={15} />Map View<UpcomingPill compact /></button>
        </div>
      </div>

      {view === 'map' ? <MapPlaceholder count={filtered.length} /> : <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 318px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <th style={{ padding: '11px 8px 11px 14px', width: 18 }}><input type="checkbox" checked={allOnPage} onChange={toggleAll} style={{ cursor: 'pointer' }} /></th>
              {['Asset', 'Asset Type', 'Client / Site', 'Location', 'Criticality', 'Status', 'IP Address', 'Warranty', 'Health'].map((h, i) =>
                <th key={i} style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 12px' }}>
                  {h === 'Status' || h === 'Health' ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>{h}<ReadOnlyTag /></span> : h}</th>)}
              <th style={{ width: 36 }}></th>
            </tr></thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan={10} style={{ padding: '28px 14px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>No assets match the current filters.</td></tr>}
              {visible.map((a) => {
                const isSel = selected === a.tag; const expired = a.warranty === 'Expired';
                const critColor = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[a.criticality];
                return (
                  <tr key={a.tag} onClick={() => setSelected(a.tag)} style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent' }}>
                    <td style={{ padding: '10px 8px 10px 14px' }} onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={!!sel[a.tag]} onChange={() => toggleOne(a.tag)} style={{ cursor: 'pointer' }} /></td>
                    <td style={{ padding: '10px 12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><DeviceTile type={a.type} />
                      <div><div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}><IdChip id={a.eg} /><span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{a.model}</span></div></div></div></td>
                    <td style={{ fontSize: 12.5 }}>{a.type}</td>
                    <td>{a.client}<div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{a.site}</div></td>
                    <td>{a.loc}<div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{a.sub}</div></td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: critColor }} />{a.criticality}</span></td>
                    <td><StatusPending /></td>
                    <td style={{ fontSize: 12.5 }}>{a.ip}</td>
                    <td><div style={{ fontSize: 12.5, color: expired ? 'hsl(var(--destructive))' : 'inherit', fontWeight: expired ? 600 : 400 }}>{a.warranty}</div>
                      <div style={{ fontSize: 11, color: expired ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))', marginTop: 1 }}>({a.warrantyDays})</div></td>
                    <td><span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>—</span></td>
                    <td onClick={(e) => e.stopPropagation()}><AssetKebab /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px 8px' }}><PreviewPill />{selCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))' }}>{selCount} selected</span>}<div style={{ flex: 1 }}><Pagination label={`Showing ${filtered.length === 0 ? 0 : (pg - 1) * PER + 1} to ${Math.min(pg * PER, filtered.length)} of ${filtered.length} assets`} page={pg} pages={pages} onPage={setPage} /></div></div>
        </div>
        <AssetDetail asset={asset} onClose={() => setSelected(null)} />
      </div>}
    </div>
  );
}

function MapPlaceholder({ count }) {
  return <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', padding: 40, minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10 }}>
    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="map" size={30} color="hsl(var(--muted-foreground))" /></div>
    <div style={{ fontSize: 16, fontWeight: 700 }}>Map View</div>
    <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', maxWidth: 380 }}>Plotting {count} asset{count === 1 ? '' : 's'} by site location is on the roadmap — the geospatial layer ships with asset monitoring.</div>
    <UpcomingPill />
  </div>;
}

function AssetMoreFilters() {
  const [open, setOpen] = React.useState(false);
  const extra = [['Manufacturer', false], ['Supplier', false], ['Project', false], ['Cost Centre', false], ['Warranty Status', false], ['Install Date', false], ['Online/Offline State', true]];
  return <div style={{ position: 'relative' }}>
    <button onClick={() => setOpen((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 12px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--input))', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', fontWeight: 500, color: 'hsl(var(--foreground))', cursor: 'pointer', whiteSpace: 'nowrap' }}><Icon name="sliders-horizontal" size={15} color="hsl(var(--muted-foreground))" />More Filters</button>
    {open && <React.Fragment>
      <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
      <div style={{ position: 'absolute', top: 44, left: 0, zIndex: 31, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, boxShadow: 'var(--shadow-lg)', padding: 12, width: 230 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {extra.map(([l, up]) => <div key={l}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'hsl(var(--muted-foreground))', marginBottom: 4 }}>{l}{up && <UpcomingPill compact />}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32, border: '1px solid hsl(var(--input))', borderRadius: 7, padding: '0 9px', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>All<Icon name="chevron-down" size={13} /></div>
          </div>)}
        </div>
      </div>
    </React.Fragment>}
  </div>;
}
function AssetKebab() {
  const [open, setOpen] = React.useState(false);
  const acts = ['View Asset Profile', 'Run Connectivity Test', 'Create Service Ticket', 'Link Supplier Invoice', 'Update Status', 'Edit Asset'];
  return <div style={{ position: 'relative' }}>
    <span onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'inline-flex' }}><Icon name="more-vertical" size={16} /></span>
    {open && <React.Fragment>
      <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
      <div style={{ position: 'absolute', top: 22, right: 0, zIndex: 31, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 9, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', minWidth: 190 }}>
        {acts.map((a) => <div key={a} onClick={() => setOpen(false)} style={{ padding: '8px 12px', fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap', color: 'hsl(var(--foreground))' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted) / 0.5)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>{a}</div>)}
      </div>
    </React.Fragment>}
  </div>;
}
function AssetDetail({ asset: a, onClose }) {
  const expired = a.warranty === 'Expired';
  const critColor = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[a.criticality];
  const [tab, setTab] = useStateAs('Overview');
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <DeviceTile type={a.type} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}><StatusPending /><button onClick={onClose} title="Close" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'inline-flex', padding: 2 }}><Icon name="x" size={16} /></button></div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{a.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><IdChip id={a.eg} /></div>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>{a.brand} · {a.model}</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 12, paddingTop: 5 }}>
          <KV k="Client / Site"><span style={{ color: 'hsl(var(--primary))' }}>{a.client}</span></KV>
          <KV k="Location">{a.loc} – {a.sub}</KV>
          <KV k="Asset Type">{a.type}</KV>
          <KV k="Criticality"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: critColor }} />{a.criticality}</span></KV>
          <KV k="IP Address">{a.ip}</KV>
          <KV k="MAC Address">{a.mac ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.mac}</span> : <PendingDash />}</KV>
          <KV k="Brand / Manufacturer">{a.brand}</KV>
          <KV k="Serial Number">{a.serial || a.tag}</KV>
          <KV k="Firmware" tag={<PreviewPill />}>{a.firmware ? a.firmware : <PendingDash />}</KV>
          <KV k="Asset Tag / ID"><IdChip id={a.eg} /></KV>
          <KV k="Install Date">{a.install || '—'}</KV>
          <KV k="Installed Under (Job)">{a.fj ? <IdChip id={a.fj} /> : <PendingDash />}</KV>
          <KV k="Warranty Expiry"><span style={{ color: expired ? 'hsl(var(--destructive))' : 'inherit', fontWeight: expired ? 600 : 500 }}>{a.warranty} ({a.warrantyDays})</span></KV>
          <KV k="Supplier Invoice (warranty proof)">{a.po ? <IdChip id={a.po} /> : <PendingDash />}</KV>
          <KV k="Last Service" tag={<PreviewPill />}><PendingDash /></KV>
          <KV k="Next Maintenance Due" tag={<PreviewPill />}><PendingDash /></KV>
          <KV k="QR Code" tag={<UpcomingPill />}>{a.qr ? <span style={{ color: 'hsl(var(--muted-foreground))' }}>Tagged</span> : <span style={{ color: 'hsl(var(--destructive))' }}>Not tagged</span>}</KV>
          <KV k="Status" tag={<ReadOnlyTag />}><StatusPending /></KV>
        </div>
        {/* health — monitoring engine output, not live */}
        <div style={{ marginTop: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><span style={{ fontSize: 12.5, fontWeight: 600 }}>Health Score</span><ReadOnlyTag /></div>
          <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: 'hsl(var(--muted-foreground))' }}>—<span style={{ fontSize: 14, fontWeight: 600 }}> /100</span></div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 7, color: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}><Icon name="loader" size={13} />Calculating…</div>
            <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 6 }}>Asset monitoring is rolling out — scores appear once the device feed is live.</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))', margin: '12px -15px 0', padding: '10px 15px', alignItems: 'center' }}>
          {[['layout-grid', 'Overview'], ['history', 'History'], ['file-text', 'Files'], ['bell', 'Alerts'], ['link', 'Linked']].map(([ic, l], i) =>
            <span key={i} onClick={() => setTab(l)} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 500, color: tab === l ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', cursor: 'pointer' }}>
              <Icon name={ic} size={16} />{l}</span>)}
          <span style={{ marginLeft: 'auto' }}><PreviewPill /></span>
        </div>
        {tab === 'Overview' && <div style={{ paddingTop: 13 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 9 }}>Quick Actions</div>
          {[['user', 'View Asset Profile', false], ['history', 'View Service History', false], ['file-text', 'View Linked Files', false], ['map-pin', 'View Asset Location (Map)', false], ['activity', 'Run Connectivity Test', true], ['ticket', 'Log Service Ticket', false]].map(([ic, l, up], i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 11px', marginBottom: 7, fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--primary-subtle))'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={ic} size={14} />{l}{up && <UpcomingPill compact />}</span><Icon name="arrow-right" size={14} /></div>)}
        </div>}
        {tab === 'History' && <div style={{ paddingTop: 13 }}>
          {[['Installed', a.install || '—', 'Commissioned under ' + (a.fj || 'FJ-000291')], ['Firmware updated', '12 Mar 2026', a.firmware || 'V5.7.3'], ['Service visit', '04 Feb 2026', 'Preventative maintenance'], ['Alert raised', 'Recent', (a.alerts && a.alerts[0] ? a.alerts[0][1] : 'No alerts')]].map(([t, d, m], i, arr) =>
            <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: i < arr.length - 1 ? 12 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: 'hsl(var(--primary))', marginTop: 4 }} />{i < arr.length - 1 && <span style={{ flex: 1, width: 1.5, background: 'hsl(var(--border))', marginTop: 2 }} />}</div>
              <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{d} · {m}</div></div></div>)}
        </div>}
        {tab === 'Files' && <div style={{ paddingTop: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['Datasheet.pdf', '420 KB'], ['Install-cert.pdf', '180 KB'], ['Config-backup.cfg', '12 KB']].map(([f, s], i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 10px' }}><Icon name="file-text" size={15} color="hsl(var(--info))" /><span style={{ flex: 1, fontSize: 12.5 }}>{f}</span><span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{s}</span></div>)}
        </div>}
        {tab === 'Alerts' && <div style={{ paddingTop: 13 }}>
          {(a.alerts && a.alerts.length) ? a.alerts.map(([tier, title, when], i) => {
            const c = tier === 'Critical' ? 'hsl(var(--destructive))' : tier === 'Warning' ? 'hsl(var(--warning))' : 'hsl(var(--info))';
            return <div key={i} style={{ display: 'flex', gap: 9, padding: '7px 0', borderBottom: i < a.alerts.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</span><span style={{ fontSize: 9.5, fontWeight: 600, color: c, background: `${c.replace(')', ' / 0.12)')}`, padding: '0 6px', borderRadius: 999 }}>{tier}</span></div>
              <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{when}</div></div></div>;
          }) : <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>No active alerts for this asset.</div>}
        </div>}
        {tab === 'Linked' && <div style={{ paddingTop: 13 }}>
          <KV k="Project"><span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>{a.project || 'PRJ-000142'}</span></KV>
          <KV k="Cost Centre"><span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>{a.cc || a.costCentre || 'CC-000045'}</span></KV>
          <KV k="Supplier"><span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>{a.supplier || 'SUP-000019'}</span></KV>
          <KV k="Installed Under (Job)">{a.fj ? <IdChip id={a.fj} /> : <PendingDash />}</KV>
        </div>}
      </Panel>
      <Panel title="Recent Alerts" action={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ReadOnlyTag /><UpcomingPill /></span>}>
        {(a.alerts && a.alerts.length) ? a.alerts.map(([tier, title, when], i) => {
          const c = tier === 'Critical' ? 'hsl(var(--destructive))' : tier === 'Warning' ? 'hsl(var(--warning))' : 'hsl(var(--info))';
          return <div key={i} style={{ display: 'flex', gap: 9, padding: '7px 0', borderBottom: i < a.alerts.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</span><span style={{ fontSize: 9.5, fontWeight: 600, color: c, background: `${c.replace(')', ' / 0.12)')}`, padding: '0 6px', borderRadius: 999 }}>{tier}</span></div>
            <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{when}</div></div></div>;
        }) : <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', padding: '4px 0' }}>No active alerts for this asset.</div>}
      </Panel>
      <Panel title="More" action={<UpcomingPill />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['image', 'Photos'], ['shield-check', 'Warranty'], ['activity', 'Monitoring'], ['save', 'Programming Backups'], ['external-link', 'Open Device Web Link'], ['key', 'Credentials (vault ref)'], ['qr-code', 'Print / Regenerate QR'], ['eye', 'Customer Visibility']].map(([ic, l], i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>
              <Icon name={ic} size={14} />{l}</div>)}
        </div>
      </Panel>
      <Panel title="Linked Items">
        <KV k="Project"><span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>{a.project || 'PRJ-000142'}</span></KV>
        <KV k="Cost Centre"><span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>{a.cc || a.costCentre || 'CC-000045'}</span></KV>
        <KV k="Supplier"><span style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}>{a.supplier || 'SUP-000019'}</span></KV>
        <KV k="PO / Invoice">{a.po ? <span style={{ color: 'hsl(var(--primary))', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)' }}>{a.po}<Icon name="external-link" size={12} /></span> : <PendingDash />}</KV>
      </Panel>
    </div>
  );
}
function AlertRow({ color, title, sub, last }) {
  return <div style={{ display: 'flex', gap: 9, padding: '7px 0', borderBottom: last ? 'none' : '1px solid hsl(var(--border))' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginTop: 5, flexShrink: 0 }} />
    <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{sub}</div></div></div>;
}

Object.assign(window, { AssetsScreen });
