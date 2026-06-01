// ETG Dashboard — Projects screen.
const { useState: useStateProj } = React;

// KPI card with read-only (engine-computed) support.
function ProjKpiCard({ title, value, sub, icon, color, readOnly }) {
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: readOnly ? 0.55 : 1 }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 6px', letterSpacing: '-0.02em', color: readOnly ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{readOnly ? '—' : value}</div>
        {readOnly ? <ReadOnlyTag /> : <div style={{ fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}>{sub}</div>}
      </div>
    </div>
  );
}
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
      <td style={{ fontSize: 13 }}><PendingDash /></td>
      <td style={{ fontSize: 13 }}><PendingDash /></td>
      <td><PendingDash /></td>
      <td><PendingDash /></td>
      <td><StatusBadge status={cc.status} /></td>
    </tr>
  );
}

function ProjectsScreen({ onNewProject }) {
  const [selected, setSelected] = useStateProj(PROJECTS[0].id);
  const [expanded, setExpanded] = useStateProj(PROJECTS[0].id);
  const project = PROJECTS.find((p) => p.id === selected);

  return (
    <div>
      <PageHeader title="Projects" description="Master Projects & Cost Centres"
        actions={<>
          <Button variant="outline" icon="download">Export</Button><span style={{ alignSelf: 'center' }}><UpcomingPill /></span>
          <Button variant="outline" icon="filter">Filters</Button>
          <Button variant="primary" icon="plus" onClick={onNewProject}>New Project</Button>
        </>} />
      <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {PROJ_KPIS.map((k, i) => <ProjKpiCard key={i} {...k} />)}
      </div>

      {/* filter bar — search + live filters; More Filters tagged Upcoming */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Search projects by name, client, PRJ-…" />
        <Select label="Status: Active" />
        <Select label="Client: All" />
        <Select label="Project Manager: All" />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Select label="More Filters" /><UpcomingPill /></span>
      </div>

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
              {PROJECTS.map((p) => {
                const isExp = expanded === p.id && p.costCentres.length > 0;
                const isSel = selected === p.id;
                return (
                  <React.Fragment key={p.id}>
                    <tr onClick={() => setSelected(p.id)} style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent' }}>
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
                      <td><PendingDash /></td>
                      <td><PendingDash /></td>
                      <td style={{ fontSize: 13 }}>{p.end}</td>
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
          <div style={{ padding: '0 16px 8px' }}><Pagination label="Showing 1 to 6 of 28 projects" /></div>
        </div>

        {/* Detail panel */}
        <ProjectDetail project={project} />
      </div>
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
function ProjectDetail({ project }) {
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
          <KV k="Service Type" tag={<ReadOnlyTag />}>{project.serviceType}</KV>
          <KV k="Site Location">{project.loc}</KV>
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
        <QuickAction label="Project Settings" />
      </Panel>
      <Panel title="Key Indicators">
        {/* Invoice Readiness — engine output, nothing to show yet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
          <Icon name="receipt" size={15} color="hsl(var(--muted-foreground))" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Invoice Readiness</span><PreviewPill />
        </div>
        <div style={{ marginBottom: 12 }}><CalculatingCard note="The invoice-readiness engine isn't live yet." /></div>
        <Indicator icon="dollar-sign" label="Uninvoiced Amount" tag={<ReadOnlyTag />} value={<PendingDash />} />
        <Indicator icon="wrench" label="Open Service Tickets" tag={<PreviewPill />} value={<span style={{ color: 'hsl(var(--muted-foreground))' }}>— from ST-</span>} />
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
