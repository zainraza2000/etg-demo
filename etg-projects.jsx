// ETG Dashboard — Projects screen.
const { useState: useStateProj } = React;

const PROJ_KPIS = [
  { title: 'Active Projects', value: '28', sub: 'View all', icon: 'folder', color: 'blue' },
  { title: 'Total Contract Value', value: '$4,280,950', sub: 'View report', icon: 'dollar-sign', color: 'green' },
  { title: 'Total Actual Cost', icon: 'bar-chart-3', color: 'orange', readOnly: true },
  { title: 'Overall Margin', icon: 'pie-chart', color: 'violet', readOnly: true },
  { title: 'Margin Risk Projects', icon: 'alert-triangle', color: 'red', readOnly: true },
  { title: 'Invoice Ready', icon: 'check-circle-2', color: 'slate', readOnly: true },
];

// Header cell with a Read-only tag stacked beneath the label.
function ThRO({ label, sub, pad }) {
  return <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: sub ? 11 : 12, color: 'hsl(var(--muted-foreground))', padding: pad || '11px 16px' }}>
    <div>{label}</div><div style={{ marginTop: 4 }}><ReadOnlyTag /></div></th>;
}

function CostCentreRow({ cc }) {
  return (
    <tr style={{ background: 'hsl(var(--muted) / 0.4)' }}>
      <td style={{ padding: '9px 16px 9px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 3, height: 30, borderRadius: 2, background: 'hsl(var(--muted-foreground) / 0.4)' }} />
          <div>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{cc.name}</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{cc.id}</div>
          </div>
        </div>
      </td>
      <td style={{ fontSize: 13 }}>{cc.budget}</td>
      <td style={{ fontSize: 13 }}>{cc.actual}</td>
      <td style={{ fontSize: 13, fontWeight: 600, color: cc.margin < 0 ? 'hsl(var(--destructive))' : cc.margin < 10 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>{cc.margin}%</td>
      <td><RiskBadge risk={cc.risk} /></td>
      <td><ProgressBar value={cc.progress} width={88} color={cc.progress >= 100 ? 'hsl(var(--success))' : 'hsl(var(--primary))'} /></td>
      <td><StatusBadge status={cc.status} /></td>
    </tr>
  );
}

function ProjectsScreen({ onNewProject }) {
  const [selected, setSelected] = useStateProj(PROJECTS[0].id);
  const [expanded, setExpanded] = useStateProj(PROJECTS[0].id);
  const [search, setSearch] = useStateProj('');
  const [fStatus, setFStatus] = useStateProj('All');
  const [fClient, setFClient] = useStateProj('All');
  const [fPm, setFPm] = useStateProj('All');
  const [marginRiskOnly, setMarginRiskOnly] = useStateProj(false);
  const [page, setPage] = useStateProj(1);
  const [view, setView] = useStateProj('list');
  const PER = 6;

  const clients = ['All', ...Array.from(new Set(PROJECTS.map((p) => p.client)))];
  const pms = ['All', ...Array.from(new Set(PROJECTS.map((p) => p.pm)))];
  const q = search.trim().toLowerCase();
  const filtered = PROJECTS.filter((p) =>
    (!q || (p.name + ' ' + p.client + ' ' + p.id + ' ' + p.loc).toLowerCase().includes(q)) &&
    (fStatus === 'All' || p.status === fStatus) &&
    (fClient === 'All' || p.client === fClient) &&
    (fPm === 'All' || p.pm === fPm) &&
    (!marginRiskOnly || p.margin < 10));
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const pg = Math.min(page, pages);
  const visible = filtered.slice((pg - 1) * PER, pg * PER);
  const reset = () => setPage(1);
  const project = PROJECTS.find((p) => p.id === selected) || filtered[0] || PROJECTS[0];

  return (
    <div>
      <PageHeader title="Projects" description="Master Projects & Cost Centres"
        actions={<>
          <Button variant="outline" icon="download">Export</Button><span style={{ alignSelf: 'center' }}><UpcomingPill /></span>
          <Button variant="outline" icon="filter">Filters</Button>
          <Button variant="primary" icon="plus" onClick={onNewProject}>New Project</Button>
        </>} />
      <div style={{ marginBottom: 18, display: 'flex', flexWrap: 'nowrap', gap: 12 }}>
        {PROJ_KPIS.map((k, i) => i === 4
          ? <KpiCard key={i} title={k.title} icon={k.icon} color={k.color} value={String(PROJECTS.filter((p) => p.margin < 10).length)} sub="View list" onClick={() => { setMarginRiskOnly((v) => !v); reset(); }} active={marginRiskOnly} />
          : k.readOnly
            ? <KpiCard key={i} title={k.title} icon={k.icon} color={k.color} valueMuted iconOpacity={0.55} tag={<ReadOnlyTag />} />
            : <KpiCard key={i} title={k.title} value={k.value} sub={k.sub} icon={k.icon} color={k.color} />)}
      </div>

      {/* filter bar — search + live filters; More Filters tagged Upcoming */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Search projects by name, client, PRJ-…" value={search} onChange={(v) => { setSearch(v); reset(); }} />
        <Select label="Status" value={fStatus} options={['All', 'Quoted', 'Planned', 'In Progress', 'On Hold', 'Completed']} onChange={(v) => { setFStatus(v); reset(); }} />
        <Select label="Client" value={fClient} options={clients} onChange={(v) => { setFClient(v); reset(); }} />
        <Select label="Project Manager" value={fPm} options={pms} onChange={(v) => { setFPm(v); reset(); }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Select label="More Filters" /><UpcomingPill /></span>
        <div style={{ marginLeft: 'auto' }}>
          <ViewToggle value={view} onChange={setView} options={[{ id: 'list', label: 'List View', icon: 'list' }, { id: 'board', label: 'Board View', icon: 'layout-grid' }]} />
        </div>
      </div>

      {view === 'board' ? <ProjectBoard projects={filtered} onSelect={setSelected} /> :
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
        {/* Table */}
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 16px' }}>Project</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 16px' }}>Client</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 16px' }}>Status</th>
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 16px' }}>Contract Value</th>
              <ThRO label="Margin" />
              <ThRO label="Health Score" />
              <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 16px' }}>End Date</th>
              <th style={{ verticalAlign: 'top' }}></th>
            </tr></thead>
            <tbody>
              {visible.length === 0 && <tr><td colSpan={8} style={{ padding: '26px 16px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>No projects match your filters.</td></tr>}
              {visible.map((p) => {
                const isExp = expanded === p.id && p.costCentres.length > 0;
                const isSel = selected === p.id;
                return (
                  <React.Fragment key={p.id}>
                    <tr onClick={() => setSelected(p.id)} style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent', boxShadow: p.margin < 10 ? 'inset 3px 0 0 hsl(var(--destructive))' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {p.costCentres.length > 0
                            ? <span onClick={(e) => { e.stopPropagation(); setExpanded(isExp ? null : p.id); }} style={{ cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}><Icon name={isExp ? 'chevron-down' : 'chevron-right'} size={16} /></span>
                            : <span style={{ width: 16 }} />}
                          <div>
                            <IdChip id={p.id} />
                            <div style={{ fontSize: 12.5, color: 'hsl(var(--foreground))', marginTop: 4, fontWeight: 500 }}>{p.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.client}<div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{p.loc}</div></td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ fontWeight: 500 }}>{p.value}</td>
                      <td style={{ fontWeight: 600, color: p.margin < 0 ? 'hsl(var(--destructive))' : p.margin < 10 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>{p.margin}%</td>
                      <td><HealthChip score={p.health} /></td>
                      <td style={{ fontSize: 13, color: p.overdue ? 'hsl(var(--destructive))' : 'inherit', fontWeight: p.overdue ? 600 : 400 }}>{p.end}{p.overdue && <div style={{ fontSize: 10.5 }}>Overdue</div>}</td>
                      <td><Icon name="more-horizontal" size={18} color="hsl(var(--muted-foreground))" /></td>
                    </tr>
                    {isExp && <>
                      <tr style={{ background: 'hsl(var(--muted) / 0.4)' }}>
                        <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11, color: 'hsl(var(--muted-foreground))', padding: '8px 16px 8px 40px' }}>Cost Centres ({p.costCentres.length})</th>
                        <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11, color: 'hsl(var(--muted-foreground))', padding: '8px 16px' }}>Budget</th>
                        <ThRO label="Actual" sub pad="8px 16px" />
                        <ThRO label="Margin" sub pad="8px 16px" />
                        <ThRO label="Margin Risk" sub pad="8px 16px" />
                        <ThRO label="Invoice Progress" sub pad="8px 16px" />
                        <th style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 11, color: 'hsl(var(--muted-foreground))', padding: '8px 16px' }}>Status</th>
                        <th></th>
                      </tr>
                      {p.costCentres.map((cc, i) => <CostCentreRow key={i} cc={cc} />)}
                    </>}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '0 16px 8px' }}><Pagination label={`Showing ${filtered.length === 0 ? 0 : (pg - 1) * PER + 1} to ${Math.min(pg * PER, filtered.length)} of ${filtered.length} projects`} page={pg} pages={pages} onPage={setPage} /></div>
        </div>

        {/* Detail panel */}
        <ProjectDetail project={project} />
      </div>}
    </div>
  );
}

function ProjectBoard({ projects, onSelect }) {
  const cols = ['Quoted', 'In Progress', 'On Hold', 'Completed'];
  const marginColor = (m) => m < 0 ? 'hsl(var(--destructive))' : m < 10 ? 'hsl(var(--warning))' : 'hsl(var(--success))';
  const [moved, setMoved] = useStateProj({});
  const [dragId, setDragId] = useStateProj(null);
  const [over, setOver] = useStateProj(null);
  const statusOf = (p) => moved[p.id] || p.status;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
      {cols.map((status) => {
        const cards = projects.filter((p) => statusOf(p) === status);
        return (
          <div key={status}
            onDragOver={dragId ? (e) => { e.preventDefault(); if (over !== status) setOver(status); } : undefined}
            onDragLeave={dragId ? () => { if (over === status) setOver(null); } : undefined}
            onDrop={dragId ? () => { setMoved((m) => ({ ...m, [dragId]: status })); setDragId(null); setOver(null); } : undefined}
            style={{ borderRadius: 12, padding: over === status ? 6 : 0, background: over === status ? 'hsl(var(--primary) / 0.06)' : 'transparent', outline: over === status ? '2px dashed hsl(var(--primary))' : 'none', outlineOffset: '-2px', transition: 'background .1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <StatusBadge status={status} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{cards.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 40 }}>
              {cards.length === 0 && <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '14px 0', textAlign: 'center' }}>Drop a project here</div>}
              {cards.map((p) => (
                <div key={p.id} draggable onDragStart={(e) => { setDragId(p.id); e.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => { setDragId(null); setOver(null); }}
                  onClick={() => onSelect(p.id)} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: 12, boxShadow: p.margin < 10 ? 'inset 3px 0 0 hsl(var(--destructive)), var(--shadow-sm)' : 'var(--shadow-sm)', cursor: 'grab', opacity: dragId === p.id ? 0.45 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="grip-vertical" size={13} color="hsl(var(--muted-foreground))" /><IdChip id={p.id} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, margin: '6px 0 2px' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{p.client}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: marginColor(p.margin) }}>{p.margin}%</span>
                    <HealthChip score={p.health} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KV({ k, tag, children }) {
  return <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '6px 0', fontSize: 12.5 }}>
    <span style={{ color: 'hsl(var(--muted-foreground))', display: 'inline-flex', alignItems: 'center', gap: 6 }}>{k}{tag}</span>
    <span style={{ fontWeight: 500, textAlign: 'right' }}>{children}</span></div>;
}
function QuickAction({ label, tag, muted }) {
  const clickable = !muted;
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsl(var(--border))',
    borderRadius: 9, padding: '10px 12px', marginBottom: 8, fontSize: 13, fontWeight: 500, color: muted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))', cursor: clickable ? 'pointer' : 'default' }}
    onMouseEnter={(e) => { if (clickable) e.currentTarget.style.background = 'hsl(var(--primary-subtle))'; }}
    onMouseLeave={(e) => { if (clickable) e.currentTarget.style.background = 'transparent'; }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>{label}{tag}</span><Icon name="arrow-right" size={15} /></div>;
}
// ---- Client invoice gate: blocked (Draft) until all supplier discrepancies reconciled ----
function projectInvoiceBlockers(p) {
  const out = [];
  if (typeof p.margin === 'number' && p.margin < 10) out.push({ label: `Project margin ${p.margin}% is below the 10% threshold`, sev: 'block' });
  (p.costCentres || []).forEach((cc) => { if (cc.risk === 'CRITICAL' || cc.margin < 0) out.push({ label: `${cc.name}: margin ${cc.margin}% (${cc.risk})`, sev: 'block' }); });
  (PROJECT_RECON[p.id] || []).forEach((d) => out.push(d));
  return out;
}
function InvoiceGate({ project }) {
  const blockers = projectInvoiceBlockers(project);
  const blocks = blockers.filter((b) => b.sev === 'block');
  const warns = blockers.filter((b) => b.sev === 'warn');
  const ready = blocks.length === 0;
  const [done, setDone] = React.useState(false);
  React.useEffect(() => { setDone(false); }, [project.id]);
  const accent = ready ? 'var(--success)' : 'var(--destructive)';
  return (
    <Panel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="receipt" size={15} color="hsl(var(--muted-foreground))" />Client Invoice Gate</h3>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, color: `hsl(${accent})`, background: `hsl(${accent} / 0.12)`, border: `1px solid hsl(${accent} / 0.3)` }}>
          <Icon name={ready ? 'check-circle-2' : 'lock'} size={11} />{ready ? 'Ready · Draft' : 'Blocked · Draft'}</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5, marginBottom: 11 }}>No client invoice is sent until every supplier cost for this job is reconciled and the margin is verified — then it generates as a <b style={{ color: 'hsl(var(--foreground))' }}>draft for review</b>.</div>
      {blocks.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: warns.length ? 9 : 0 }}>
        {blocks.map((b, i) => <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 12, color: 'hsl(var(--destructive))', fontWeight: 500 }}><Icon name="ban" size={13} style={{ flexShrink: 0, marginTop: 1 }} />{b.label}</div>)}
      </div>}
      {warns.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {warns.map((b, i) => <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 12, color: 'hsl(var(--warning))', fontWeight: 500 }}><Icon name="alert-triangle" size={13} style={{ flexShrink: 0, marginTop: 1 }} />{b.label}</div>)}
      </div>}
      {ready && !done && <div style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 12, color: 'hsl(var(--success))', fontWeight: 500 }}><Icon name="check-circle-2" size={14} />All supplier costs reconciled · margin verified.</div>}
      <div style={{ marginTop: 12 }}>
        {ready
          ? (done
            ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--success))', background: 'hsl(var(--success-subtle) / 0.6)', border: '1px solid hsl(var(--success) / 0.3)', borderRadius: 8, padding: '9px 11px' }}><Icon name="file-check-2" size={15} />Draft invoice created — ready for your review before send.</div>
            : <Button variant="primary" icon="file-text" onClick={() => setDone(true)} style={{ width: '100%', justifyContent: 'center', background: 'hsl(var(--success))' }}>Generate Draft Invoice</Button>)
          : <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center', height: 40, borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.5)', color: 'hsl(var(--muted-foreground))', fontSize: 13.5, fontWeight: 500, cursor: 'not-allowed' }}><Icon name="lock" size={15} />Generate Client Invoice</div>
              <div style={{ fontSize: 11, color: 'hsl(var(--destructive))', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="alert-triangle" size={12} />Blocked — resolve {blocks.length} discrepanc{blocks.length === 1 ? 'y' : 'ies'} before invoicing.</div>
            </div>}
      </div>
    </Panel>
  );
}
function ProjectDetail({ project }) {
  const openTickets = TICKETS.filter((t) => t.client === project.client && t.status !== 'Resolved').length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 0 }}>
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Project Overview</h3>
          <StatusBadge status={project.status} />
        </div>
        <div style={{ margin: '11px 0 2px' }}><IdChip id={project.id} /></div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{project.name}</div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 6 }}>
          <KV k="Client"><span style={{ color: 'hsl(var(--primary))' }}>{project.client}</span></KV>
          <KV k="Project Manager"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name={project.pm} size={20} />{project.pm}</span></KV>
          <KV k="Service Type">{project.serviceType}</KV>
          <KV k="Site Location"><span>{project.loc} <span style={{ color: 'hsl(var(--muted-foreground))' }}>· {siteZoneFor(project.client)}</span></span></KV>
          <KV k="Start Date">{project.start}</KV>
          <KV k="End Date">{project.end}</KV>
          <KV k="Contract Value">{project.value}</KV>
          <KV k="Overall Margin" tag={<ReadOnlyTag />}><PendingDash /></KV>
          <KV k="Overall Health Score" tag={<ReadOnlyTag />}><PendingDash /></KV>
        </div>
      </Panel>
      <Panel title="Quick Actions">
        <QuickAction label="View Project Dashboard" tag={<UpcomingPill />} muted />
        <QuickAction label="View Cost Centres" />
        <QuickAction label="Create New Cost Centre" />
        <QuickAction label="Project Financials" tag={<UpcomingPill />} muted />
        <QuickAction label="Project Documents" tag={<UpcomingPill />} muted />
        <QuickAction label="Project Settings" />
      </Panel>
      <InvoiceGate project={project} />
      <Panel title="Key Indicators">
        <Indicator icon="dollar-sign" label="Uninvoiced Amount" tag={<ReadOnlyTag />} value={<PendingDash />} />
        <Indicator icon="wrench" label="Open Service Tickets" tag={<PreviewPill />} value={<span style={{ color: 'hsl(var(--muted-foreground))' }}>{openTickets} open</span>} />
        <Indicator icon="check-circle-2" label="Pending Approvals" tag={<UpcomingPill />} value={<PendingDash />} />
        <Indicator icon="alert-triangle" label="Offline Assets" tag={<UpcomingPill />} value={<PendingDash />} />
      </Panel>
    </div>
  );
}
function Indicator({ icon, label, value, tag }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 13, gap: 8 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}><Icon name={icon} size={15} color="hsl(var(--muted-foreground))" /><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{label}{tag}</span></span>
    <span style={{ fontWeight: 600, flexShrink: 0 }}>{value}</span></div>;
}

Object.assign(window, { ProjectsScreen });
