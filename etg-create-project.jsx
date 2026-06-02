// ETG Dashboard — Create New Project (full page, route /projects/new).
const { useState: useStateCP } = React;

const cpInput = { width: '100%', height: 40, border: '1px solid hsl(var(--input))', borderRadius: 8, padding: '0 11px', boxSizing: 'border-box', fontSize: 13.5, fontFamily: 'inherit', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))' };
function CpField({ label, req, hint, tag, children }) {
  return <div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>{label}{req && <span style={{ color: 'hsl(var(--destructive))' }}>*</span>}{tag}</label>
    {hint && <span style={{ fontSize: 11.5, color: 'hsl(var(--primary))', fontWeight: 500, cursor: 'pointer' }}>{hint}</span>}</div>{children}</div>;
}
function CpText({ value, ph }) { return <input defaultValue={value} placeholder={ph} style={cpInput} />; }
// a selected related-record shown as a locked id chip + name, still a picker (chevron)
function CpSelected({ id, name }) {
  return <div style={{ ...cpInput, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
    <IdChip id={id} /><span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span><Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" /></div>;
}
// locked, system/engine-computed value (never an input)
function CpReadOnly({ value }) {
  return <div style={{ ...cpInput, display: 'flex', alignItems: 'center', gap: 8, background: 'hsl(var(--muted) / 0.45)', color: 'hsl(var(--muted-foreground))', cursor: 'default' }}>
    <span style={{ flex: 1 }}>{value || '—'}</span><Icon name="lock" size={14} color="hsl(var(--muted-foreground))" /></div>;
}
// muted, non-editable value box — for Preview / Upcoming fields (source not wired yet)
function CpMuted({ value }) {
  return <div style={{ ...cpInput, display: 'flex', alignItems: 'center', background: 'hsl(var(--muted) / 0.45)', color: 'hsl(var(--muted-foreground))', cursor: 'default' }}>{value || '—'}</div>;
}
// read-only status/stage badge in a locked container
function CpBadgeRO({ status }) {
  return <div style={{ ...cpInput, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'hsl(var(--muted) / 0.45)', cursor: 'default' }}>
    <StatusBadge status={status} /><Icon name="lock" size={14} color="hsl(var(--muted-foreground))" /></div>;
}
// dashed "Calculating…" engine card (Financial summary, scores)
function CpDashed({ label, big }) {
  return <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    {big ? <span style={{ fontSize: 19, fontWeight: 800, color: 'hsl(var(--muted-foreground))' }}>—</span> : <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>{label}</span>}
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}><Icon name="loader" size={12} />Calculating…</span></div>;
}
function CpSelect({ value, dot, ph }) {
  return <div style={{ ...cpInput, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: value ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
    {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />}<span style={{ flex: 1 }}>{value || ph}</span><Icon name="chevron-down" size={15} color="hsl(var(--muted-foreground))" /></div>;
}
function CpMoney({ value, suffix }) {
  return <div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', fontSize: 13.5 }}>$</span>
    <input defaultValue={value} style={{ ...cpInput, paddingLeft: 22 }} />{suffix && <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>{suffix}</span>}</div>;
}
function CpArea({ ph }) { return <textarea placeholder={ph} style={{ ...cpInput, height: 70, padding: 11, resize: 'none', lineHeight: 1.5 }} />; }
function CpToggle({ label, on }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
    <span style={{ fontSize: 13 }}>{label}</span>
    <span style={{ width: 38, height: 22, borderRadius: 999, background: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.35)', position: 'relative', cursor: 'pointer', transition: 'background .15s' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-sm)', transition: 'left .15s' }} /></span></div>;
}
function CpPanel({ title, children, accent, tag }) {
  return <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 18, boxShadow: 'var(--shadow-sm)' }}>
    <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: 7 }}>{accent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />}{title}{tag && <span style={{ marginLeft: 2 }}>{tag}</span>}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>{children}</div></div>;
}
// read-only intelligence read-out (dashed, engine output, nothing to show yet)
function CpReadout({ label }) {
  return <div><div style={{ fontSize: 12, fontWeight: 500, marginBottom: 5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>{label}<ReadOnlyTag /></div>
    <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 19, fontWeight: 800, color: 'hsl(var(--muted-foreground))' }}>—</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}><Icon name="loader" size={12} />Calculating…</span></div></div>;
}
function CpScore({ label }) {
  return <CpField label={label}><div style={{ position: 'relative' }}><input defaultValue="0" style={cpInput} /><span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))', fontSize: 12 }}>/100</span></div></CpField>;
}

function CreateProjectScreen({ onClose }) {
  const tabs = [
    { name: 'Project Info' }, { name: 'Financials' }, { name: 'Scheduling' },
    { name: 'Assets', up: true }, { name: 'Parts & Suppliers', up: true },
    { name: 'Compliance', up: true }, { name: 'Risk & Automation', up: true }, { name: 'Notes & Files' },
  ];
  const [tab, setTab] = useStateCP('Project Info');
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: 0, display: 'inline-flex' }}><Icon name="arrow-left" size={16} /></button>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Create New Project</h1>
            <IdChip id="PRJ-000148" note="Assigned on creation" />
          </div>
          <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0 26px' }}>Complete all required fields to create a new project</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={onClose}>Create Project</Button>
        </div>
      </div>

      {/* created-from-quote origin banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'hsl(258 80% 97%)', border: '1px solid hsl(258 70% 88%)', borderRadius: 9, padding: '9px 13px', marginBottom: 14 }}>
        <Icon name="file-check-2" size={15} color="hsl(258 60% 50%)" />
        <span style={{ fontSize: 12.5, color: 'hsl(var(--foreground))' }}>Created from accepted quote</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, color: 'hsl(258 60% 50%)', background: 'hsl(258 80% 99%)', border: '1px solid hsl(258 70% 88%)', borderRadius: 999, padding: '1px 8px' }}>Q-002184</span>
        <span style={{ marginLeft: 'auto' }}><UpcomingPill /></span>
      </div>

      {/* tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid hsl(var(--border))', marginBottom: 18, overflowX: 'auto' }}>
        {tabs.map((t) => {
          const on = t.name === tab;
          return <button key={t.name} onClick={() => setTab(t.name)} style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, fontWeight: on ? 600 : 500, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6,
            color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', borderBottom: on ? '2px solid hsl(var(--primary))' : '2px solid transparent', padding: '8px 12px', marginBottom: -1, cursor: 'pointer' }}>{t.name}{t.up && <UpcomingPill compact />}</button>;
        })}
      </div>

      {/* Row 1: Core / Financial / Operational */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <CpPanel title="Core Project Details">
          <CpField label="Project Name" req><CpText ph="Enter project name" /></CpField>
          <CpField label="Description"><div><CpText ph="One-line summary of the project" /><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>Short summary shown in lists — longer detail goes in Project Notes below.</div></div></CpField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Client" req><CpSelected id="CLI-000023" name="ABC Corporate" /></CpField>
            <CpField label="Primary Site / Location" req hint="+ New"><CpSelected id="SITE-000050" name="Sydney Office — Level 1" /></CpField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Simpro ID / External Ref"><CpText ph="e.g. 123456 or EX-001" /></CpField>
            <CpField label="Project Owner / Manager" req><CpSelected id="USR-000012" name="John Manager" /></CpField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Status" tag={<ReadOnlyTag />}><CpBadgeRO status="Quoted" /></CpField>
            <CpField label="Priority" req><CpSelect value="Medium" dot="hsl(var(--warning))" /></CpField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Service Type" req><CpSelect value="Mixed" /></CpField>
            <CpField label="Job Type" req><CpSelect value="Installation" /></CpField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Project Stage" tag={<ReadOnlyTag />}><CpBadgeRO status="Planned" /></CpField>
            <CpField label="Invoice Readiness" tag={<PreviewPill />}><CpMuted value="Not Ready" /></CpField>
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="info" size={12} />Status &amp; stage advance through the project's action buttons, not a dropdown.</div>
        </CpPanel>

        <CpPanel title="Financial Control">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Quoted Value (AUD)" req><CpMoney value="0.00" /></CpField>
            <CpField label="Target Margin (0–1)" req><CpText value="0.30" /></CpField>
            <CpField label="Cost Budget (AUD)" tag={<UpcomingPill />}><CpMuted value="0.00" /></CpField>
            <CpField label="Labour Budget (AUD)" tag={<UpcomingPill />}><CpMuted value="0.00" /></CpField>
            <CpField label="Materials Budget (AUD)" tag={<UpcomingPill />}><CpMuted value="0.00" /></CpField>
            <CpField label="Approved Value (AUD)" tag={<UpcomingPill />}><CpMuted value="—" /></CpField>
            <CpField label="Variation Value (AUD)" tag={<UpcomingPill />}><CpMuted value="—" /></CpField>
            <CpField label="Retention / Holdback" tag={<UpcomingPill />}><CpMuted value="—" /></CpField>
            <CpField label="Invoiced Value (AUD)" tag={<ReadOnlyTag />}><CpReadOnly value="—" /></CpField>
            <CpField label="Current Margin (0–1)" tag={<ReadOnlyTag />}><CpReadOnly value="—" /></CpField>
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="info" size={12} />Cost, labour &amp; materials budgets roll up to the project's cost centres.</div>
          <div style={{ background: 'hsl(var(--muted) / 0.5)', borderRadius: 9, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}><Icon name="cpu" size={13} />Cost-rollup engine</span><ReadOnlyTag />
            </div>
            <div style={{ marginBottom: 8 }}><CpDashed label="Gross Profit (AUD)" /></div>
            <div><CpDashed label="Current Margin" /></div>
            <div style={{ marginTop: 9, display: 'inline-flex', alignItems: 'center', gap: 5, color: 'hsl(var(--primary))', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}><Icon name="calculator" size={13} />Margin Calculator</div>
          </div>
        </CpPanel>

        <CpPanel title="Operational Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Start Date"><CpSelect ph="Select date" /></CpField>
            <CpField label="Assigned Technicians" hint="+ Add"><CpSelect ph="Select technicians" /></CpField>
            <CpField label="Target End Date"><CpSelect ph="Select date" /></CpField>
            <CpField label="Subcontractors" hint="+ Add"><CpSelect ph="Select subcontractors" /></CpField>
            <CpField label="Scheduled Date"><CpSelect ph="Select date" /></CpField>
            <CpField label="Required Skills / Licences"><CpSelect ph="Select or type skills" /></CpField>
            <CpField label="Completion Date" tag={<ReadOnlyTag />}><CpReadOnly value="—" /></CpField>
            <CpField label="SLA / Urgency" tag={<UpcomingPill />}><CpMuted value="Standard" /></CpField>
          </div>
          <CpField label="Site Access Requirements"><CpArea ph="Enter site access requirements" /></CpField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <CpField label="Risk Level" tag={<UpcomingPill />}><CpMuted value="—" /></CpField>
            <CpField label="Project Tags"><CpSelect ph="Add tags..." /></CpField>
          </div>
        </CpPanel>
      </div>

      {/* Row 2: five operational panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 16 }}>
        <CpPanel title="Asset Impact" tag={<UpcomingPill />}>
          <CpField label="Primary Asset" tag={<PreviewPill />}><div style={{ position: 'relative' }}><input placeholder="Search asset or enter ID (e.g. EG-0042)" style={{ ...cpInput, paddingRight: 32, background: 'hsl(var(--muted) / 0.45)', color: 'hsl(var(--muted-foreground))' }} /><span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={15} color="hsl(var(--muted-foreground))" /></span></div></CpField>
          <CpField label="Asset Criticality"><CpSelect ph="Select criticality" /></CpField>
          <CpField label="Asset Impact"><CpSelect ph="Select impact" /></CpField>
          <CpField label="Assets Affected" tag={<PreviewPill />}><div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>None linked yet</div></CpField>
          <CpField label="Asset Notes"><CpArea ph="Enter asset impact details" /></CpField>
        </CpPanel>
        <CpPanel title="Team & Resources" tag={<UpcomingPill />}>
          <CpField label="Internal Team" hint="+ Add"><CpSelect ph="Select team members" /></CpField>
          <CpField label="Labour Hours (Budget)" tag={<PreviewPill />}><CpMuted value="0.00" /></CpField>
          <CpField label="Equipment Required" hint="+ Add"><CpSelect ph="Select equipment" /></CpField>
          <CpField label="Special Requirements"><CpArea ph="Enter special requirements" /></CpField>
        </CpPanel>
        <CpPanel title="Parts &amp; Supplier Dependency" tag={<UpcomingPill />}>
          <CpField label="Parts Ordered Status"><CpSelect value="Not Ordered" dot="hsl(var(--muted-foreground))" /></CpField>
          <CpField label="Parts Received Status"><CpSelect value="Not Received" dot="hsl(var(--muted-foreground))" /></CpField>
          <CpField label="Supplier / Manufacturer" tag={<PreviewPill />}><CpMuted value="Select supplier" /></CpField>
          <CpField label="Critical Parts / Long Lead Items"><CpArea ph="List critical or long lead items" /></CpField>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'hsl(var(--primary))', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}><Icon name="plus" size={13} />Add Parts List</div>
        </CpPanel>
        <CpPanel title="Compliance &amp; Documentation" tag={<UpcomingPill />}>
          <CpToggle label="SWMS Required" />
          <CpToggle label="Photos Required" on />
          <CpToggle label="Asset Records Required" on />
          <CpToggle label="Commissioning Required" />
          <CpToggle label="Customer Sign-off Required" on />
          <CpToggle label="Defect Check Required" />
          <CpField label="Required Documents" hint="+ Add"><CpSelect ph="Select documents" /></CpField>
          <CpField label="Compliance Notes"><CpArea ph="Enter compliance notes" /></CpField>
        </CpPanel>
        <CpPanel title="ETG Elite Intelligence" tag={<UpcomingPill />}>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5, marginTop: -2 }}>Scores are produced by the intelligence engine — they can't be entered by hand.</div>
          <CpReadout label="Job Readiness Score" />
          <CpReadout label="Delivery Risk Score" />
          <CpReadout label="Profit Risk Score" />
          <CpField label="Client Relationship Risk" tag={<UpcomingPill />}><CpMuted value="—" /></CpField>
          <CpField label="Automation Notes / AI Summary" tag={<ReadOnlyTag />}>
            <div style={{ ...cpInput, height: 64, padding: 11, background: 'hsl(var(--muted) / 0.45)', color: 'hsl(var(--muted-foreground))', fontSize: 12.5, lineHeight: 1.45, cursor: 'default' }}>AI summary will appear here once the project is created.</div>
          </CpField>
          <button style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', height: 38, borderRadius: 8, border: '1px solid hsl(258 70% 86%)', background: 'hsl(258 80% 96%)', color: 'hsl(258 60% 50%)', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}><Icon name="sparkles" size={15} />Generate AI Summary</button>
        </CpPanel>
      </div>

      {/* Row 3: notes & files */}
      <CpPanel title="Additional Notes & Files">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
          <CpField label="Project Notes"><textarea placeholder="Enter any additional notes about the project" style={{ ...cpInput, height: 92, padding: 11, resize: 'none' }} /></CpField>
          <CpField label="Attachments" tag={<UpcomingPill />}><div style={{ border: '1.5px dashed hsl(var(--border))', borderRadius: 9, padding: '20px 12px', textAlign: 'center', height: 92, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--muted) / 0.35)' }}>
            <Icon name="upload-cloud" size={22} color="hsl(var(--muted-foreground))" /><div style={{ fontSize: 12, marginTop: 4, color: 'hsl(var(--muted-foreground))' }}>Drag and drop files here</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 500, marginTop: 2 }}>or Browse Files</div></div></CpField>
          <CpField label="Linked Files" tag={<PreviewPill />}><div style={{ height: 92, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}><div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>No files linked yet</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'hsl(var(--muted-foreground))', fontSize: 12.5, fontWeight: 500 }}><Icon name="plus" size={13} />Add File</div></div></CpField>
        </div>
      </CpPanel>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, margin: '18px 0 8px' }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="check" onClick={onClose}>Create Project</Button>
      </div>
    </div>
  );
}

Object.assign(window, { CreateProjectScreen });
