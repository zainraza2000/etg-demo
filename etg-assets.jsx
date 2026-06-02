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
  const asset = ASSETS.find((a) => a.tag === selected);
  return (
    <div>
      <PageHeader title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>Client Assets <PreviewPill /></span>} description="All client assets and equipment — asset monitoring & health is rolling out"
        actions={<>
          <Button variant="outline" icon="download">Export</Button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="upload">Import Assets</Button><UpcomingPill /></span>
          <Button variant="outline" icon="filter">Filters</Button>
          <Button variant="primary" icon="plus">Add Asset</Button>
        </>} />
      <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {ASSET_KPIS.map((k, i) => <AsKpiCard key={i} {...k} />)}
      </div>
      <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {ASSET_KPIS2.map((k, i) => <AsKpiCard key={i} {...k} />)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Search assets by name, type, serial, IP, location..." />
        <Select label="Client: All" /><Select label="Site: All" /><Select label="Asset Type: All" /><Select label="Status: All" />
        <div style={{ marginLeft: 'auto', display: 'inline-flex', border: '1px solid hsl(var(--input))', borderRadius: 8, overflow: 'hidden' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'hsl(var(--primary-subtle))', color: 'hsl(var(--primary))', fontWeight: 500, fontSize: 13, padding: '8px 13px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="list" size={15} />List View</button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', borderLeft: '1px solid hsl(var(--input))', background: 'hsl(var(--card))', color: 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: 13, padding: '8px 11px', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="map" size={15} />Map View<UpcomingPill compact /></button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 318px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <th style={{ padding: '11px 8px 11px 14px', width: 18 }}><input type="checkbox" /></th>
              {['Asset', 'Asset Type', 'Client / Site', 'Location', 'Criticality', 'Status', 'IP Address', 'Warranty', 'Health'].map((h, i) =>
                <th key={i} style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 12px' }}>
                  {h === 'Status' || h === 'Health' ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>{h}<ReadOnlyTag /></span> : h}</th>)}
            </tr></thead>
            <tbody>
              {ASSETS.map((a) => {
                const isSel = selected === a.tag; const expired = a.warranty === 'Expired';
                const critColor = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[a.criticality];
                return (
                  <tr key={a.tag} onClick={() => setSelected(a.tag)} style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent' }}>
                    <td style={{ padding: '10px 8px 10px 14px' }}><input type="checkbox" /></td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px 8px' }}><PreviewPill /><div style={{ flex: 1 }}><Pagination label="Showing 1 to 10 of 1,248 assets" /></div></div>
        </div>
        <AssetDetail asset={asset} />
      </div>
    </div>
  );
}

function AssetDetail({ asset: a }) {
  const expired = a.warranty === 'Expired';
  const critColor = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[a.criticality];
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <DeviceTile type={a.type} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}><StatusPending /></div>
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
          {[['layout-grid', 'Overview', true], ['history', 'History'], ['file-text', 'Files'], ['bell', 'Alerts'], ['link', 'Linked']].map(([ic, l, on], i) =>
            <span key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 500, color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', cursor: 'pointer' }}>
              <Icon name={ic} size={16} />{l}</span>)}
          <span style={{ marginLeft: 'auto' }}><PreviewPill /></span>
        </div>
        <div style={{ paddingTop: 13 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 9 }}>Quick Actions</div>
          {[['user', 'View Asset Profile', false], ['history', 'View Service History', false], ['file-text', 'View Linked Files', false], ['map-pin', 'View Asset Location (Map)', false], ['activity', 'Run Connectivity Test', true], ['ticket', 'Log Service Ticket', false]].map(([ic, l, up], i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 11px', marginBottom: 7, fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--primary-subtle))'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name={ic} size={14} />{l}{up && <UpcomingPill compact />}</span><Icon name="arrow-right" size={14} /></div>)}
        </div>
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
