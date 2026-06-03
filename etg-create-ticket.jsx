// ETG Dashboard — Create New Ticket (full page, route /tickets/new).
const { useState: useStateCT } = React;

// ---- form field primitives ----
function CtLabel({ children, req }) {
  return <label style={{ fontSize: 12.5, fontWeight: 500, display: 'block', marginBottom: 6 }}>{children}{req && <span style={{ color: 'hsl(var(--destructive))' }}> *</span>}</label>;
}
function CtField({ label, req, children }) {
  return <div><CtLabel req={req}>{label}</CtLabel>{children}</div>;
}
const ctInput = { width: '100%', height: 42, border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '0 12px', boxSizing: 'border-box', fontSize: 14, fontFamily: 'inherit', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' };
function CtText({ value, placeholder, sub }) {
  return <div><input defaultValue={value} placeholder={placeholder} style={ctInput} />{sub && <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{sub}</div>}</div>;
}
function CtSelect({ value, sub, icon, dot, options }) {
  const [v, setV] = useStateCT(value || '');
  const [open, setOpen] = useStateCT(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const opts = options || [v, 'Option A', 'Option B'].filter(Boolean);
  return <div ref={ref} style={{ position: 'relative' }}>
    <div onClick={() => setOpen((o) => !o)} style={{ ...ctInput, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      {icon && <Icon name={icon} size={16} color="hsl(var(--muted-foreground))" />}
      {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />}
      <span style={{ flex: 1, color: v ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>{v || 'Select…'}</span><Icon name="chevron-down" size={16} color="hsl(var(--muted-foreground))" style={{ transform: open ? 'rotate(180deg)' : 'none' }} /></div>
    {open && <div style={{ position: 'absolute', top: 44, left: 0, right: 0, zIndex: 50, maxHeight: 220, overflowY: 'auto', background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 9, boxShadow: 'var(--shadow-lg)', padding: 4 }}>
      {opts.map((o) => <div key={o} onClick={() => { setV(o); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13.5, background: o === v ? 'hsl(var(--muted))' : 'transparent' }}>
        <span style={{ width: 14 }}>{o === v && <Icon name="check" size={14} color="hsl(var(--primary))" />}</span>{o}</div>)}
    </div>}
    {sub && <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{sub}</div>}</div>;
}
function CtArea({ value, count }) {
  return <div><textarea defaultValue={value} style={{ ...ctInput, height: 84, padding: 12, resize: 'none', lineHeight: 1.5 }} />
    {count && <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{count}</div>}</div>;
}
function CtSection({ n, title, tag, children, style }) {
  return <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow-sm)', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
      <span style={{ width: 24, height: 24, borderRadius: 7, background: 'hsl(var(--primary-subtle))', color: 'hsl(var(--primary))', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
      <h2 style={{ fontSize: 16.5, fontWeight: 600, margin: 0 }}>{title}</h2>
      {tag && <span style={{ marginLeft: 4 }}>{tag}</span>}
    </div>
    {children}
  </div>;
}
function ActivePill() {
  return <span style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--success))', background: 'hsl(var(--success-subtle))', border: '1px solid hsl(var(--success) / 0.3)', padding: '2px 9px', borderRadius: 999 }}>Active</span>;
}
// read-only / system-controlled affordances
function ReadOnlyTag() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.7)', border: '1px solid hsl(var(--border))', padding: '1px 8px', borderRadius: 999 }}><Icon name="lock" size={11} />Read-only</span>;
}
function UpcomingPill() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: 'hsl(258 60% 50%)', background: 'hsl(258 80% 96%)', border: '1px solid hsl(258 70% 86%)', padding: '1px 8px', borderRadius: 999 }}><Icon name="sparkles" size={11} />Upcoming</span>;
}
function PreviewPill() {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: 'hsl(var(--warning))', background: 'hsl(var(--warning-subtle))', border: '1px solid hsl(var(--warning) / 0.3)', padding: '1px 7px', borderRadius: 999 }}><Icon name="eye" size={10} />Preview</span>;
}
// a read-only field value (looks like an input but locked + system-controlled)
function CtReadOnly({ value, sub, muted }) {
  return <div><div style={{ ...ctInput, display: 'flex', alignItems: 'center', gap: 8, background: 'hsl(var(--muted) / 0.45)', color: muted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', cursor: 'default' }}>
    <span style={{ flex: 1, fontStyle: muted ? 'italic' : 'normal' }}>{value}</span><Icon name="lock" size={14} color="hsl(var(--muted-foreground))" /></div>
    {sub && <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{sub}</div>}</div>;
}
function VerifyRow({ label, last }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : '1px solid hsl(var(--border))' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13 }}><Icon name="check-circle-2" size={16} color="hsl(var(--success))" />{label}</span>
    <ActivePill /></div>;
}

function CreateTicketScreen({ onClose }) {
  return (
    <div>
      {/* page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', color: 'hsl(var(--muted-foreground))', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', padding: 0 }}>
              <Icon name="arrow-left" size={16} /></button>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Create New Ticket</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.5)', borderRadius: 999, padding: '4px 12px', marginLeft: 2 }}>
              <Icon name="lock" size={13} color="hsl(var(--muted-foreground))" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'hsl(var(--foreground))' }}>ST-000077</span>
              <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>· Assigned on creation</span>
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0 26px' }}>Log a new service request or issue reported by a customer</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={onClose}>Create Ticket</Button>
        </div>
      </div>

      {/* read-only system identity — set by the platform on creation */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'hsl(var(--muted) / 0.5)', border: '1px solid hsl(var(--border))', borderRadius: 9, padding: '7px 13px', marginBottom: 14 }}>
        {[['Status', 'New'], ['Owner', 'Evolution (placeholder)'], ['Type', 'Customer']].map(([k, v], i) =>
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}:</span><span style={{ fontWeight: 600 }}>{v}</span>{i < 2 && <span style={{ color: 'hsl(var(--border))', marginLeft: 8 }}>|</span>}</span>)}
        <ReadOnlyTag />
      </div>

      {/* Customer Summary band */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: '14px 6px', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <SummaryStat label="Customer" value="ABC Group" strong />
        <SummaryDiv />
        <SummaryStat label="ETG Customer" yes />
        <SummaryDiv />
        <SummaryStat label="Localcom Customer" yes />
        <SummaryDiv />
        <SummaryStat label="Sites" value="12" preview />
        <SummaryDiv />
        <SummaryStat label="Active Services" value="18" preview />
        <SummaryDiv />
        <SummaryStat label="Installed Assets" value="245" preview />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Section 1 */}
        <CtSection n="1" title="Customer & Site">
          <div style={{ display: 'flex', gap: 22 }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <CtField label="Customer" req><div><div style={{ marginBottom: 5, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'hsl(258 60% 50%)', fontWeight: 500, cursor: 'pointer' }}><Icon name="plus" size={12} />New customer<Icon name="sparkles" size={10} /></div><CtSelect value="ABC Corporate" sub="ABN: 12 345 678 910" /></div></CtField>
              <CtField label="Contact Name" req><div><div style={{ marginBottom: 5, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'hsl(var(--primary))', fontWeight: 500, cursor: 'pointer' }}><Icon name="user-search" size={12} />Link existing contact</div><CtText value="Sarah Johnson" /></div></CtField>
              <CtField label="Phone" req><CtText value="0412 345 678" /></CtField>
              <CtField label="Site" req><div><div style={{ marginBottom: 5, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'hsl(258 60% 50%)', fontWeight: 500, cursor: 'pointer' }}><Icon name="plus" size={12} />New site<Icon name="sparkles" size={10} /></div><CtSelect value="Sydney Office" sub="123 George Street, Sydney NSW 2000" /></div></CtField>
              <CtField label="Email"><CtText value="sarah.johnson@abccorp.com.au" /></CtField>
              <CtField label="Contact Role"><CtSelect value="IT Manager" /></CtField>
            </div>
            <div style={{ width: 250, flexShrink: 0, border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 15, background: 'hsl(var(--muted) / 0.35)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 11 }}>Customer Overview</div>
              <OvRow k="Customer Group" v="ABC Corporate Group" />
              <OvRow k="Localcom Customer" yes />
              <OvRow k="Evolution Customer" yes />
              <OvRow k="Active Services (This Site)" v="8" />
              <OvRow k="Active Assets (This Site)" v="24" />
              <div style={{ marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'hsl(var(--primary))', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>View Customer Details <Icon name="external-link" size={13} /></div>
            </div>
          </div>
        </CtSection>

        {/* Section 2 */}
        <CtSection n="2" title="Issue Details">
          <div style={{ display: 'flex', gap: 22 }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 16, alignItems: 'start' }}>
              <CtField label="Issue Type" req><CtSelect value="Internet / NBN Issue" icon="globe" options={ISSUE_TYPES} /></CtField>
              <CtField label="Issue Summary" req><CtText value="Internet is down – entire office no connectivity" /></CtField>
              <CtField label="Issue Category" req><CtSelect value="Internet Not Working" icon="wifi" options={['Hardware Fault', 'Software / Config', 'Network / Connectivity', 'Power', 'Physical Damage', 'Access / Permissions', 'Preventive Maintenance', 'Internet Not Working', 'Other']} /></CtField>
              <CtField label="Issue Description" req><CtArea value="The internet connection at our office is not working. No staff can access the internet including WiFi and wired connections." count="142/1000" /></CtField>
              <CtField label="Source" req><CtSelect value="Phone" icon="phone" options={SOURCES} /></CtField>
            </div>
            <div style={{ width: 250, flexShrink: 0, border: '1px solid hsl(var(--info) / 0.3)', background: 'hsl(var(--info-subtle))', borderRadius: 10, padding: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginBottom: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'hsl(var(--info))', fontWeight: 600, fontSize: 13 }}><Icon name="info" size={16} />How ownership is determined</span>
                <UpcomingPill />
              </div>
              <p style={{ fontSize: 12.5, color: 'hsl(var(--foreground))', lineHeight: 1.55, margin: '0 0 9px' }}>Once automatic routing is live, the system will use the issue type and active services at this site to assign each ticket to the correct team.</p>
              <p style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.55, margin: 0 }}>Until then, tickets are routed manually — and anything unclear goes to our Triage team for review.</p>
            </div>
          </div>
        </CtSection>

        {/* Section 3 + 4 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)', gap: 16 }}>
          <CtSection n="3" title="Additional Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <CtField label="Priority" req><CtSelect value="High" dot="hsl(var(--destructive))" options={PRIORITIES} /></CtField>
              <CtField label="Job Classification"><CtSelect value="Service Call" icon="briefcase" options={JOB_CLASSIFICATIONS} /></CtField>
              <CtField label="Due by"><div style={{ ...ctInput, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><Icon name="calendar-clock" size={16} color="hsl(var(--muted-foreground))" /><span style={{ flex: 1 }}>15 May 2026, <SiteTime time="12:00 PM" zone="Australia/Sydney" oneline /></span><Icon name="chevron-down" size={16} color="hsl(var(--muted-foreground))" /></div></CtField>
              <CtField label="Customer Impact"><CtSelect value="Site disrupted" icon="alert-triangle" options={CUSTOMER_IMPACT} /></CtField>
              <CtField label="Affects Multiple Sites?"><CtSelect value="No" options={['No', 'Yes']} /></CtField>
              <CtField label="Preferred Contact Method"><CtSelect value="Phone Call" options={['Phone Call', 'Email', 'SMS']} /></CtField>
              <CtField label="Preferred Contact Time"><CtSelect value="Anytime" /></CtField>
              <CtField label="Is the site currently operational?"><CtSelect value="No – Not Operational" /></CtField>
              <CtField label="Best time for technician to attend"><CtSelect value="ASAP" /></CtField>
              <CtField label="Third-party installed / takeover" req={false}><div style={{ ...ctInput, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ width: 34, height: 19, borderRadius: 999, background: 'hsl(var(--muted-foreground) / 0.35)', position: 'relative' }}><span style={{ position: 'absolute', top: 2, left: 2, width: 15, height: 15, borderRadius: '50%', background: '#fff' }} /></span>No</span>
                <UpcomingPill /></div></CtField>
            </div>
          </CtSection>
          <CtSection n="4" title="Attachments">
            <div style={{ border: '1.5px dashed hsl(var(--border))', borderRadius: 10, padding: '22px 16px', textAlign: 'center', marginBottom: 12 }}>
              <Icon name="upload-cloud" size={26} color="hsl(var(--muted-foreground))" />
              <div style={{ fontSize: 13, marginTop: 7 }}>Drag and drop files here or click to browse</div>
              <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>JPG, PNG, PDF up to 10MB</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '9px 12px' }}>
              <Icon name="file-text" size={16} color="hsl(var(--info))" />
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 500 }}>internet-outage-office.jpg</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>2.4 MB</div></div>
              <Icon name="x" size={15} color="hsl(var(--muted-foreground))" />
            </div>
          </CtSection>
        </div>

        {/* Section 5 */}
        <CtSection n="5" title="Service & Asset Verification" tag={<ReadOnlyTag />}>
          <p style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', margin: '-8px 0 16px', lineHeight: 1.5 }}>System-generated from the customer's active services and installed assets at this site. This section is read-only and updates automatically.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 26 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Active Localcom Services <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>(This Site)</span></span>
                <PreviewPill />
              </div>
              <VerifyRow label="NBN Business 100/40" />
              <VerifyRow label="SIP Trunk Service" />
              <VerifyRow label="Hosted PBX" last />
              <div style={{ marginTop: 9, color: 'hsl(var(--primary))', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>View all 5 services</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Active ETG Assets <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>(This Site)</span></span>
                <PreviewPill />
              </div>
              <AssetVerifyRow icon="cctv" label="25 x CCTV Cameras" />
              <AssetVerifyRow icon="cpu" label="Access Control System" />
              <AssetVerifyRow icon="network" label="2 x Network Switches" last />
              <div style={{ marginTop: 9, color: 'hsl(var(--primary))', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>View all 24 assets</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>Likely Owner <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>(Determined by System)</span></span>
                <UpcomingPill />
              </div>
              <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: 'hsl(var(--muted-foreground))' }}>—</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'hsl(var(--muted-foreground))', fontSize: 12.5, fontWeight: 600 }}><Icon name="loader" size={14} />Calculating…</div>
                <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5, marginTop: 8 }}>Automatic routing isn't live yet. Until then, this ticket will be routed manually by the Triage team.</div>
              </div>
            </div>
          </div>
        </CtSection>

        {/* footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 8 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={onClose}>Create Ticket</Button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, yes, strong, preview }) {
  return <div style={{ flex: 1, padding: '0 18px', minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'hsl(var(--muted-foreground))' }}>{label}</span>
      {preview && <PreviewPill />}
    </div>
    {yes ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: 'hsl(var(--success))', background: 'hsl(var(--success-subtle))', border: '1px solid hsl(var(--success) / 0.3)', padding: '2px 9px', borderRadius: 999 }}><Icon name="check" size={13} />YES</span>
      : <div style={{ fontSize: strong ? 18 : 20, fontWeight: 700, letterSpacing: '-0.01em', color: preview ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{value}</div>}
  </div>;
}
function SummaryDiv() { return <div style={{ width: 1, alignSelf: 'stretch', background: 'hsl(var(--border))' }} />; }
function OvRow({ k, v, yes }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 12.5 }}>
    <span style={{ color: 'hsl(var(--muted-foreground))' }}>{k}</span>
    {yes ? <span style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--success))', background: 'hsl(var(--success-subtle))', border: '1px solid hsl(var(--success) / 0.3)', padding: '1px 8px', borderRadius: 999 }}>Yes</span>
      : <span style={{ fontWeight: 600 }}>{v}</span>}</div>;
}
function AssetVerifyRow({ icon, label, last }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : '1px solid hsl(var(--border))' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13 }}><Icon name={icon} size={16} color="hsl(var(--muted-foreground))" />{label}</span>
    <ActivePill /></div>;
}

Object.assign(window, { CreateTicketScreen });
