// ETG Dashboard — Calendar (technician scheduling) screen.
const { useState: useStateCal } = React;

const JOB_STATE = {
  'In Progress': { bg: 'hsl(var(--success-subtle))', bar: 'hsl(var(--success))', badge: 'complete' },
  'Planned': { bg: 'hsl(var(--info-subtle))', bar: 'hsl(var(--info))', badge: 'active' },
  'Ready': { bg: 'hsl(var(--info-subtle))', bar: 'hsl(var(--info))', badge: 'active' },
  'Blocked': { bg: 'hsl(var(--destructive-subtle))', bar: 'hsl(var(--destructive))', badge: 'overdue' },
  'Overdue': { bg: 'hsl(var(--warning-subtle))', bar: 'hsl(var(--warning))', badge: 'medium' },
  'Cancelled': { bg: 'hsl(var(--muted) / 0.5)', bar: 'hsl(var(--muted-foreground))', badge: 'draft' },
  'Unassigned': { bg: 'hsl(var(--destructive-subtle))', bar: 'hsl(var(--destructive))', badge: 'overdue' },
};
const TECH_STATE_COLOR = { 'On Site': 'hsl(var(--success))', 'Travelling': 'hsl(var(--warning))', 'On Break': 'hsl(var(--muted-foreground))' };

// per-visit readiness → tone (always defined; never blank)
const READY_TONE = {
  'Ready': 'complete', 'Planned': 'active', 'In Progress': 'active', 'At Risk': 'warning', 'Needs Review': 'warning',
  'Parts Missing': 'overdue', 'Access Missing': 'overdue', 'Skills Missing': 'overdue', 'Client Not Confirmed': 'overdue', 'Overtime Risk': 'warning', 'Travel Conflict': 'overdue', 'Blocked': 'overdue',
};
function ReadyBadge({ value, micro }) {
  const v = `var(--status-${READY_TONE[value] || 'draft'})`;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: micro ? '0 6px' : '1px 7px', borderRadius: 999, fontSize: micro ? 9 : 10, fontWeight: 600, whiteSpace: 'nowrap',
    background: `hsl(${v} / 0.13)`, color: `hsl(${v})`, border: `1px solid hsl(${v} / 0.3)` }}><Icon name="lock" size={micro ? 8 : 9} />{value}</span>;
}
function CheckRow({ checks }) {
  const items = [['wrench', 'skills', checks.skills], ['key-round', 'access', checks.access], ['package', 'parts', checks.parts], ['user-check', 'client', checks.client], ['navigation', 'travel', checks.travel], ['box', 'asset', checks.asset]];
  return <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
    {items.map(([ic, k, ok]) => <span key={k} title={k} style={{ display: 'inline-flex' }}><Icon name={ic} size={11} color={ok ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} /></span>)}
  </div>;
}

function JobBlock({ job, selected, onClick }) {
  const s = JOB_STATE[job.state] || JOB_STATE['Planned'];
  const prioColor = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[job.prio] || 'hsl(var(--muted-foreground))';
  return (
    <div onClick={onClick} style={{ background: s.bg, borderLeft: `3px solid ${s.bar}`, borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
      outline: selected ? `2px solid ${s.bar}` : 'none', boxShadow: selected ? 'var(--shadow-sm)' : 'none' }}>
      {/* time + priority dot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}><SiteTime time={job.time} zone={siteZoneFor(job.client)} small /></span>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: prioColor, flexShrink: 0 }} title={job.prio} />
      </div>
      {/* title + client/site */}
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</div>
      <div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.client} · {job.loc}</div>
      {/* readiness badge + tech live-status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, flexWrap: 'wrap' }}>
        <ReadyBadge value={job.readiness || 'Planned'} />
        {job.live && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 600, color: TECH_STATE_COLOR[job.live] || 'hsl(var(--muted-foreground))' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: TECH_STATE_COLOR[job.live] || 'hsl(var(--muted-foreground))' }} />{job.live}</span>}
      </div>
      {/* one key blocker line */}
      {job.blocker && <div style={{ fontSize: 9.5, color: s.bar, marginTop: 3, lineHeight: 1.25, display: 'flex', gap: 3 }}><Icon name="alert-triangle" size={9} style={{ flexShrink: 0, marginTop: 1 }} />{job.blocker}</div>}
      {/* tiny check-icon row */}
      {job.checks && <CheckRow checks={job.checks} />}
    </div>
  );
}

// Calendar KPI card — real system counts get a Read-only tag; not-yet-derived ones go Upcoming (—).
function CalKpiCard({ title, value, sub, icon, color, readOnly, upcoming }) {
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: upcoming ? 0.55 : 1 }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 6px', letterSpacing: '-0.02em', color: upcoming ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{upcoming ? '—' : value}</div>
        {upcoming ? <UpcomingPill /> : readOnly ? <ReadOnlyTag /> : <div style={{ fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}>{sub}</div>}
      </div>
    </div>
  );
}

function CalendarScreen() {
  const [sel, setSel] = useStateCal('0-0');
  const [worker, setWorker] = useStateCal(null); // technician index for drill-down
  const [kpiFilter, setKpiFilter] = useStateCal(null);
  const [calView, setCalView] = useStateCal('Week');
  const [gateJob, setGateJob] = useStateCal(null); // {title, gate} for queue scheduling
  const [calSearch, setCalSearch] = useStateCal('');
  const [moreFilter, setMoreFilter] = useStateCal('All');
  const [newVisitTech, setNewVisitTech] = useStateCal(null);
  const CELL = 168;
  if (newVisitTech !== null) return <NewVisitForm prefill={{ techIndex: newVisitTech }} techIndex={newVisitTech} onCancel={() => setNewVisitTech(null)} onCreate={() => setNewVisitTech(null)} />;
  // view + filter helpers (Day narrows to today's column; search/KPI/More narrow visible jobs)
  const GD = calView === 'Day' ? [2] : [0, 1, 2, 3, 4, 5, 6];
  const KMATCH = { blocked: 'Blocked', inprog: 'In Progress', unassigned: 'Unassigned', ot: 'Overdue', completed: 'Completed' };
  const jobVisible = (job, tech) => {
    if (!job) return false;
    if (calSearch) { const q = calSearch.toLowerCase(); if (!(`${job.title} ${job.client} ${job.loc || ''} ${tech || ''}`.toLowerCase().includes(q))) return false; }
    if (kpiFilter && KMATCH[kpiFilter] && job.state !== KMATCH[kpiFilter]) return false;
    if (moreFilter === 'Blocked' && job.state !== 'Blocked') return false;
    if (moreFilter === 'In Progress' && job.state !== 'In Progress') return false;
    if (moreFilter === 'Unassigned' && job.state !== 'Unassigned') return false;
    if (moreFilter === 'High priority' && job.prio !== 'High') return false;
    return true;
  };
  if (worker !== null) return <WorkerCalendar techIndex={worker} onBack={() => setWorker(null)} onOpenVisit={() => {}} />;
  // resolve selected job from the "ti-di" / "u-di" key
  let selJob = null;
  if (sel && sel.indexOf('u-') === 0) {
    const di = parseInt(sel.slice(2), 10); selJob = CAL_UNASSIGNED.find((j) => j.day === di);
  } else if (sel) {
    const [ti, di] = sel.split('-').map(Number); selJob = (CAL_JOBS[ti] || []).find((j) => j.day === di);
    if (selJob) selJob = { ...selJob, tech: TECHS[ti] && TECHS[ti].name };
  }
  const CMD_KPIS = [
    { key: 'today', title: 'Jobs Today', value: '18', sub: '▲3 vs yesterday', icon: 'calendar-days', color: 'blue' },
    { key: 'inprog', title: 'In Progress', value: '9', sub: '50% of today', icon: 'loader', color: 'blue' },
    { key: 'completed', title: 'Jobs Completed', value: '6', sub: 'Today', icon: 'check-circle-2', color: 'green' },
    { key: 'unassigned', title: 'Unassigned', value: '3', sub: 'High priority', icon: 'user-x', color: 'violet' },
    { key: 'blocked', title: 'Blocked', value: '2', sub: 'Action required', icon: 'ban', color: 'red' },
    { key: 'ot', title: 'Overtime Risk', value: '4', sub: 'This week', icon: 'alarm-clock', color: 'orange' },
    { key: 'parts', title: 'Parts Missing', value: '5', sub: 'Impacting jobs', icon: 'package-x', color: 'orange' },
    { key: 'access', title: 'Access Issues', value: '2', sub: 'Site access', icon: 'key-round', color: 'orange' },
    { key: 'working', title: 'Technicians Working', value: '22', sub: '75% of team', icon: 'users', color: 'green' },
  ];
  return (
    <div>
      {/* command-centre header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Scheduling Command Centre</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--success))' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--success))' }} />Live</span>
            <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Data as of 9:23 AM</span>
          </div>
          <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0' }}>Real-time visibility, automation and readiness for every visit.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <Button variant="outline">Today</Button>
          <Button variant="outline" icon="calendar">12 – 18 May 2026</Button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="sparkles">Auto-Schedule</Button><UpcomingPill /></span>
          <Button variant="primary" icon="plus" onClick={() => setNewVisitTech(0)}>New Visit</Button>
        </div>
      </div>
      {/* 8 clickable KPI filters */}
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 11 }}>
        {CMD_KPIS.map((k) => { const on = kpiFilter === k.key;
          return <div key={k.key} onClick={() => setKpiFilter(on ? null : k.key)} style={{ background: on ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', border: `1px solid ${on ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`, borderRadius: 11, padding: 12, boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: KPI_COLORS[k.color], display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={k.icon} size={16} color="#fff" /></span>
              <Icon name="lock" size={11} color="hsl(var(--muted-foreground))" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>{k.title}</div>
            <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{k.sub}</div>
          </div>; })}
      </div>

      {/* view tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: 'hsl(var(--muted))', borderRadius: 8, padding: 3, gap: 2 }}>
          {[['Week', false], ['Day', false], ['Technicians', false], ['Jobs List', false], ['Map View', true]].map(([t, up], i) => {
            const on = calView === t;
            return <button key={t} onClick={() => setCalView(t)} style={{ border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, padding: '6px 11px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              background: on ? 'hsl(var(--card))' : 'transparent', color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', boxShadow: on ? 'var(--shadow-sm)' : 'none' }}>{t}{up && <UpcomingPill compact />}</button>;
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <SearchInput placeholder="Search jobs, clients, sites..." value={calSearch} onChange={setCalSearch} />
          <Select label="More Filters" value={moreFilter} options={['All', 'High priority', 'Blocked', 'In Progress', 'Unassigned']} onChange={setMoreFilter} />
        </div>
      </div>

      {/* Scheduling Gate Live banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'hsl(var(--success-subtle) / 0.5)', border: '1px solid hsl(var(--success) / 0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="shield-check" size={18} color="hsl(var(--success))" /><span><span style={{ fontSize: 13, fontWeight: 700 }}>Scheduling Gate Live</span><span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginLeft: 8 }}>All visits validated against readiness rules.</span></span></span>
        <span style={{ marginLeft: 14, fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Legend:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive-subtle))', border: '1px solid hsl(var(--destructive) / 0.3)', padding: '3px 9px', borderRadius: 999 }}><Icon name="ban" size={13} />Block</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'hsl(var(--warning))', background: 'hsl(var(--warning-subtle))', border: '1px solid hsl(var(--warning) / 0.3)', padding: '3px 9px', borderRadius: 999 }}><Icon name="alert-triangle" size={13} />Warn &amp; proceed</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', background: 'hsl(var(--primary-subtle))', border: '1px solid hsl(var(--primary) / 0.3)', padding: '3px 9px', borderRadius: 999 }}><Icon name="shield-check" size={13} />Override with reason</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', cursor: 'pointer' }}><Icon name="list-checks" size={14} />Gate Rules</span>
      </div>

      {/* Unscheduled Queue tray */}
      <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '12px 14px', marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Icon name="inbox" size={16} color="hsl(var(--primary))" /><span style={{ fontSize: 13, fontWeight: 700 }}>Unscheduled Queue</span><span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>6 jobs · drag onto the grid to schedule</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', cursor: 'pointer' }}>View all queue ›</span>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
          {[['High', 'CCTV Upgrade', 'ABC Corporate', 'Blocked: Parts missing', 'block'], ['High', 'Network Upgrade', 'XYZ Building', 'Blocked: Access issue', 'block'], ['Medium', 'Switchboard Install', 'BuildCo Group', 'Warn: Skills gap', 'warn'], ['Medium', 'Lighting Audit', 'Retail Group', 'Warn: Overtime risk', 'warn'], ['Low', 'Site Inspection', "St Mary's College", 'Needs review', 'review'], ['Low', 'Quote Follow Up', 'Fusion Manufacturing', 'Unassigned', 'review']].map(([prio, title, client, why, sev], i) => {
            const pc = prio === 'High' ? 'hsl(var(--destructive))' : prio === 'Medium' ? 'hsl(var(--warning))' : 'hsl(var(--success))';
            const wc = sev === 'block' ? 'hsl(var(--destructive))' : sev === 'warn' ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))';
            return <div key={i} onClick={() => setGateJob({ title, client, why, sev })} style={{ minWidth: 188, flexShrink: 0, border: '1px solid hsl(var(--border))', borderLeft: `3px solid ${pc}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', background: 'hsl(var(--card))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: pc }} /><span style={{ fontSize: 10, fontWeight: 700, color: pc }}>{prio}</span></div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{client}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: wc, marginTop: 5 }}><Icon name={sev === 'block' ? 'ban' : sev === 'warn' ? 'alert-triangle' : 'help-circle'} size={11} />{why}</div>
            </div>;
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>
        {calView === 'Map View' ? <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', padding: 40, minHeight: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="map" size={30} color="hsl(var(--muted-foreground))" /></div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Map View</div>
          <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', maxWidth: 380 }}>Live technician routing & job locations plot here once the dispatch map ships.</div><UpcomingPill />
        </div> : calView === 'Jobs List' ? <CalJobsList kpiFilter={kpiFilter} /> : calView === 'Technicians' ? <CalTechSummary kpiFilter={kpiFilter} search={calSearch} onOpen={setWorker} /> :
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 184 + CELL * 7 }}>
              {/* header */}
              <div style={{ display: 'grid', gridTemplateColumns: `184px repeat(${GD.length}, ${CELL}px)`, borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)' }}>
                <div style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Technicians</div>
                {GD.map((i) => { const [dow, ...rest] = CAL_DAYS[i].split(' '); const isToday = i === 2;
                  return <div key={i} style={{ padding: '9px 12px', borderLeft: '1px solid hsl(var(--border))', fontSize: 12.5 }}>
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}>{dow} </span>
                    <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...(isToday ? { background: 'hsl(var(--primary))', color: '#fff', borderRadius: '50%', width: 22, height: 22 } : {}) }}>{rest[0]}</span>
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}> {rest[1]}</span></div>; })}
              </div>
              {/* tech rows */}
              {TECHS.map((tech, ti) => (
                <div key={ti} style={{ display: 'grid', gridTemplateColumns: `184px repeat(${GD.length}, ${CELL}px)`, borderBottom: '1px solid hsl(var(--border))', minHeight: 96 }}>
                  <div onClick={() => setWorker(ti)} title={`Open ${tech.name}'s calendar`} style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer', borderRadius: 8 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted) / 0.5)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Avatar name={tech.name} size={30} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2, color: 'hsl(var(--primary))' }}>{tech.name}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: TECH_STATE_COLOR[tech.state], display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: TECH_STATE_COLOR[tech.state] }} />{tech.state}</span>
                        <UpcomingPill compact />
                      </div>
                      <div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><b style={{ color: 'hsl(var(--foreground))' }}>{tech.capacity.sched.toFixed(1)}</b> / {tech.capacity.avail.toFixed(0)} hrs<Icon name="lock" size={9} /></span>
                        <span>B {tech.capacity.billable.toFixed(1)} · Travel {tech.capacity.travel.toFixed(1)}</span>
                        <span style={{ color: tech.capacity.gap === 'None' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--warning))' }}>Gap {tech.capacity.gap}</span>
                      </div>
                    </div>
                  </div>
                  {GD.map((di) => {
                    const job = (CAL_JOBS[ti] || []).find((j) => j.day === di);
                    const vis = jobVisible(job, tech.name);
                    return <div key={di} style={{ borderLeft: '1px solid hsl(var(--border))', padding: 5 }}>
                      {job && vis && <JobBlock job={job} selected={sel === `${ti}-${di}`} onClick={() => setSel(`${ti}-${di}`)} />}</div>;
                  })}
                </div>
              ))}
              {/* unassigned lane */}
              <div style={{ display: 'grid', gridTemplateColumns: `184px repeat(${GD.length}, ${CELL}px)`, minHeight: 96, background: 'hsl(var(--destructive-subtle) / 0.3)' }}>
                <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'hsl(var(--muted))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user-x" size={15} color="hsl(var(--muted-foreground))" /></span>
                  <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>Unassigned Jobs</div><div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>3 jobs</div></div>
                </div>
                {GD.map((di) => { const job = CAL_UNASSIGNED.find((j) => j.day === di); const vis = jobVisible(job, 'Unassigned');
                  return <div key={di} style={{ borderLeft: '1px solid hsl(var(--border))', padding: 5 }}>
                    {job && vis && <JobBlock job={job} selected={sel === `u-${di}`} onClick={() => setSel(`u-${di}`)} />}</div>; })}
              </div>
            </div>
          </div>
          {/* legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 16px', borderTop: '1px solid hsl(var(--border))', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {[['In Progress', 'hsl(var(--success))'], ['Planned', 'hsl(var(--info))'], ['Unassigned', 'hsl(var(--destructive))'], ['Completed', 'hsl(var(--success))'], ['Cancelled', 'hsl(var(--muted-foreground))']].map(([l, c], i) =>
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />{l}</span>)}
            </span>
            <span style={{ width: 1, height: 16, background: 'hsl(var(--border))' }} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Presence</span>
              {[['On Site', 'hsl(var(--success))'], ['Travelling', 'hsl(var(--warning))'], ['Available', 'hsl(var(--info))'], ['On Break', 'hsl(var(--muted-foreground))']].map(([l, c], i) =>
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />{l}</span>)}
              <UpcomingPill compact />
            </span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Show weekends
              <span style={{ width: 34, height: 19, borderRadius: 999, background: 'hsl(var(--primary))', position: 'relative' }}><span style={{ position: 'absolute', top: 2, right: 2, width: 15, height: 15, borderRadius: '50%', background: '#fff' }} /></span></span>
          </div>
          {/* footer roll-up */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 16px', borderTop: '1px solid hsl(var(--border))', fontSize: 12, color: 'hsl(var(--muted-foreground))', flexWrap: 'wrap' }}>
            <span><b style={{ color: 'hsl(var(--foreground))' }}>8</b> technicians</span>
            <span>Total Scheduled <b style={{ color: 'hsl(var(--foreground))' }}>128.5 hrs</b></span>
            <span>Total Available <b style={{ color: 'hsl(var(--foreground))' }}>156.0 hrs</b></span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>Utilisation <b style={{ color: 'hsl(var(--foreground))' }}>82%</b><Icon name="lock" size={11} /></span>
          </div>
        </div>}

        {/* job detail */}
        <JobDetail job={selJob} />
      </div>

      {gateJob && <CalGateModal job={gateJob} onClose={() => setGateJob(null)} />}
    </div>
  );
}

function JobDetail({ job }) {
  if (!job) return <div style={{ position: 'sticky', top: 0 }}><Panel pad={20}><div style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13, padding: '30px 0' }}><Icon name="mouse-pointer-click" size={22} /><div style={{ marginTop: 8 }}>Select a job on the board to view its details.</div></div></Panel></div>;
  const zone = siteZoneFor(job.client);
  const dayLabel = (CAL_DAYS[job.day] || '').replace(/^(\w+) /, '$1, ') + ' 2026';
  const gate = { Blocked: ['ban', 'hsl(var(--destructive))', 'Move blocked — hard stop', 'No approved quote on file. Manager override required to schedule.'],
                 Overdue: ['alarm-clock', 'hsl(var(--warning))', 'Warn & proceed', 'Visit ran past its window — confirm completion or reschedule.'],
                 Cancelled: ['x-circle', 'hsl(var(--muted-foreground))', 'Cancelled', job.reason || 'Visit cancelled.'] }[job.state];
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Visit Details</h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><StatusBadge status={job.state} /><ReadOnlyTag /></span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: '9px 0 1px' }}>{job.title}</div>
        <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{job.client}</div>
        <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginBottom: 11 }}>{job.loc}, {job.addr}</div>

        {gate && <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: `${gate[1].replace(')', ' / 0.1)')}`, border: `1px solid ${gate[1].replace(')', ' / 0.3)')}`, borderRadius: 9, padding: '9px 11px', marginBottom: 11 }}>
          <Icon name={gate[0]} size={15} color={gate[1]} style={{ flexShrink: 0, marginTop: 1 }} />
          <div><div style={{ fontSize: 12.5, fontWeight: 600, color: gate[1] }}>{gate[2]}</div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{gate[3]}</div></div></div>}

        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5 }}><Icon name="calendar" size={14} color="hsl(var(--muted-foreground))" style={{ marginTop: 2 }} />{dayLabel}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5 }}><Icon name="clock" size={14} color="hsl(var(--muted-foreground))" style={{ marginTop: 2 }} /><SiteTime time={job.time} zone={zone} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5 }}><Icon name="user" size={14} color="hsl(var(--muted-foreground))" style={{ marginTop: 2 }} />{job.tech || <span style={{ color: 'hsl(var(--destructive))' }}>Unassigned</span>}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 2 }}>
            <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Visit</span><IdChip id={job.sd} />
            <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginLeft: 4 }}>Job</span><IdChip id={job.fj} />
          </div>
          {job.fromSt && <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Converted from <IdChip id={job.fromSt} /></div>}
        </div>

        {/* readiness + scheduling intel */}
        <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 11, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <DRow label="Readiness" tag={<ReadOnlyTag compact />}><span style={{ ...statusStyle(job.readiness === 'Ready' ? 'complete' : job.readiness === 'Blocked' ? 'overdue' : job.readiness === 'In Progress' ? 'active' : 'medium'), fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 999 }}>{job.readiness}</span></DRow>
          <DRow label="Est. labour" tag={<UpcomingPill compact />}><span>{job.estHours}h <span style={{ color: 'hsl(var(--muted-foreground))' }}>· variance —</span></span></DRow>
          <DRow label="Required skills" tag={<PreviewPill />}><span style={{ color: 'hsl(var(--muted-foreground))' }}>{job.skills.join(', ')}</span></DRow>
          <DRow label="Required licences" tag={<PreviewPill />}><span style={{ color: 'hsl(var(--muted-foreground))' }}>{job.licences.join(', ')}</span></DRow>
          <DRow label="Site access" tag={<PreviewPill />}><span style={{ color: 'hsl(var(--muted-foreground))' }}>{job.siteAccess}</span></DRow>
          <DRow label="Linked assets" tag={<UpcomingPill compact />}><span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span></DRow>
          {job.whyNot && <DRow label="Why not scheduled" tag={<ReadOnlyTag compact />}><span style={{ color: 'hsl(var(--destructive))' }}>{job.whyNot}</span></DRow>}
        </div>

        {/* schedule readiness checklist */}
        <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 11, paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'hsl(var(--success))' }}>Schedule Readiness: READY</span><span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>All checks passed</span><ReadOnlyTag compact />
          </div>
          {[['Skills Verified', 'ok', 'Verified'], ['Site Access Confirmed', 'ok', 'Confirmed'], ['Parts Ready', 'warn', 'Partial — 1 item'], ['Client Confirmed', 'ok', 'Confirmed'], ['Travel Feasible', 'ok', 'ETA 6:45 AM'], ['Award / Overtime Check', 'warn', 'OT likely'], ['Linked Assets', 'ok', '2 assets']].map(([l, s, note], i) => {
            const c = s === 'ok' ? 'hsl(var(--success))' : 'hsl(var(--warning))';
            return <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '3px 0', fontSize: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name={s === 'ok' ? 'check-circle-2' : 'alert-triangle'} size={14} color={c} />{l}</span>
              <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 11.5 }}>{note}</span></div>;
          })}
        </div>
        {/* issues / risks with next-best-action */}
        <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 11, paddingTop: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8 }}>Issues / Risks</div>
          {[['ban', 'hsl(var(--destructive))', 'Parts Missing', 'High — 1× NVR-8CH unit not allocated', 'Order missing parts'], ['alert-triangle', 'hsl(var(--warning))', 'Overtime Risk', 'Medium — visit may exceed standard hours', 'Approve overtime']].map(([ic, c, title, desc, action], i) =>
            <div key={i} style={{ background: `${c.replace(')', ' / 0.08)')}`, border: `1px solid ${c.replace(')', ' / 0.25)')}`, borderRadius: 8, padding: '8px 10px', marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon name={ic} size={14} color={c} /><span style={{ fontSize: 12.5, fontWeight: 600, color: c }}>{title}</span></div>
              <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', margin: '2px 0 5px' }}>{desc}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--primary))', cursor: 'pointer' }}><Icon name="arrow-right" size={12} />{action}</span>
            </div>)}
        </div>

        <div style={{ marginTop: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600 }}>Visit Progress<UpcomingPill /></span>
            <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Pending</span>
          </div>
          <div style={{ height: 7, background: 'hsl(var(--muted))', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: '100%', background: 'repeating-linear-gradient(90deg, hsl(var(--border)) 0 6px, transparent 6px 12px)' }} /></div>
          {/* execution stage rail — structure only; live % from mobile clock-in (Upcoming) */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', margin: '12px 0 2px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 9, left: '10%', right: '10%', height: 2, background: 'hsl(var(--border))' }} />
            {['On Site', 'Work In Progress', 'Testing', 'Handover', 'Complete'].map((s, i) =>
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1, position: 'relative', zIndex: 1 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                <span style={{ fontSize: 9, fontWeight: 600, color: 'hsl(var(--muted-foreground))', textAlign: 'center', lineHeight: 1.2 }}>{s}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>—</span>
              </div>)}
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 9, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="info" size={12} />Live progress arrives with the technician mobile clock-in.</div>
        </div>
      </Panel>

      <Panel title="Quick Actions">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <CalQuickAction icon="eye" label="Open Job" />
          <CalQuickAction icon="users" label="Reassign" reassign />
          <CalQuickAction icon="send" label="Notify Client" notify />
          <CalQuickAction icon="package" label="Request Parts" parts />
          <CalQuickAction icon="calendar-plus" label="Create Return Visit" up />
          <CalQuickAction icon="activity" label="Update Progress" up />
        </div>
      </Panel>

      <Panel title="Client Contact" action={<PreviewPill />}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{job.client}</div>
        <div style={{ fontSize: 12.5, marginTop: 2, color: 'hsl(var(--muted-foreground))' }}>John Smith</div>
        <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Facilities Manager</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 9 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}><Icon name="phone" size={13} color="hsl(var(--muted-foreground))" />0412 345 678</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}><Icon name="mail" size={13} color="hsl(var(--muted-foreground))" />john.smith@abccorp.com.au</span>
        </div>
      </Panel>
    </div>
  );
}
function CalQuickAction({ icon, label, up, reassign, notify, parts }) {
  const [state, setState] = React.useState(null); // 'open' for dropdown/popover, or a confirmation string
  const live = !up;
  const tile = (children, extraStyle) => <div style={{ position: 'relative' }}>
    <div onClick={() => { if (up) return;
        if (reassign || notify) setState(state === 'open' ? null : 'open');
        else if (parts) setState(state ? null : 'Parts requested');
        else setState(state ? null : 'Opened'); }}
      style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '9px 11px', fontSize: 12.5, fontWeight: 500,
        color: up ? 'hsl(var(--muted-foreground))' : (parts && state ? 'hsl(var(--warning))' : 'hsl(var(--primary))'), cursor: up ? 'default' : 'pointer', ...extraStyle }}>
      <Icon name={parts && state ? 'package-check' : icon} size={14} />{state && !['open'].includes(state) ? state : label}{up && <span style={{ marginLeft: 'auto' }}><UpcomingPill compact /></span>}</div>
    {children}
  </div>;
  if (reassign && state === 'open') return tile(
    <div style={{ position: 'absolute', top: 38, left: 0, right: 0, zIndex: 20, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
      {TECHS.slice(0, 4).map((t) => <div key={t.name} onClick={() => setState(`Reassigned to ${t.name.split(' ')[0]}`)} style={{ padding: '7px 11px', fontSize: 12, cursor: 'pointer', color: 'hsl(var(--foreground))' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted) / 0.5)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>{t.name}</div>)}
    </div>);
  if (notify && state === 'open') return tile(
    <div style={{ position: 'absolute', top: 38, left: 0, right: 0, zIndex: 20, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, boxShadow: 'var(--shadow-lg)', padding: 10 }}>
      <div style={{ fontSize: 11.5, marginBottom: 8 }}>Send visit reminder to the client?</div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setState('Reminder queued')} style={{ flex: 1, height: 28, border: 'none', borderRadius: 6, background: 'hsl(var(--primary))', color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Send</button>
        <button onClick={() => setState(null)} style={{ flex: 1, height: 28, border: '1px solid hsl(var(--input))', borderRadius: 6, background: 'hsl(var(--card))', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
      </div>
    </div>);
  return tile(null);
}
function DRow({ label, tag, children }) {
  return <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, fontSize: 12.5 }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>{label}{tag}</span>
    <span style={{ textAlign: 'right' }}>{children}</span></div>;
}

// ---- Jobs List view + queue gate modal ----
function CalTechSummary({ kpiFilter, search, onOpen }) {
  const KMATCH = { blocked: 'Blocked', inprog: 'In Progress', unassigned: 'Unassigned', ot: 'Overdue' };
  return <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
    <div style={{ padding: '11px 16px', borderBottom: '1px solid hsl(var(--border))', fontSize: 13, fontWeight: 600 }}>Technicians — workload summary</div>
    {TECHS.map((tech, ti) => {
      let jobs = (CAL_JOBS[ti] || []);
      if (kpiFilter && KMATCH[kpiFilter]) jobs = jobs.filter((j) => j.state === KMATCH[kpiFilter]);
      if (search) { const q = search.toLowerCase(); jobs = jobs.filter((j) => `${j.title} ${j.client}`.toLowerCase().includes(q)); }
      return <div key={ti} onClick={() => onOpen(ti)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted) / 0.4)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Avatar name={tech.name} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--primary))' }}>{tech.name}</div>
          <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{jobs.length} visit{jobs.length === 1 ? '' : 's'} · {tech.capacity.sched.toFixed(1)} / {tech.capacity.avail.toFixed(0)} hrs · Gap {tech.capacity.gap}</div>
        </div>
        <span style={{ fontSize: 11, color: TECH_STATE_COLOR[tech.state], display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: TECH_STATE_COLOR[tech.state] }} />{tech.state}</span>
        <Icon name="chevron-right" size={16} color="hsl(var(--muted-foreground))" />
      </div>;
    })}
  </div>;
}
function CalJobsList({ kpiFilter }) {
  const all = []; Object.keys(CAL_JOBS).forEach((ti) => (CAL_JOBS[ti] || []).forEach((j) => all.push({ ...j, tech: TECHS[ti] && TECHS[ti].name })));
  CAL_UNASSIGNED.forEach((j) => all.push({ ...j, tech: 'Unassigned' }));
  const KMAP = { blocked: 'Blocked', inprog: 'In Progress', unassigned: 'Unassigned' };
  const want = KMAP[kpiFilter];
  const rows = want ? all.filter((j) => j.state === want || (want === 'Unassigned' && j.tech === 'Unassigned')) : all;
  return <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
      <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        {['Visit', 'Title', 'Client', 'Technician', 'Time', 'State'].map((h, i) => <th key={i} style={{ textAlign: 'left', fontWeight: 500, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', padding: '10px 12px' }}>{h}</th>)}
      </tr></thead>
      <tbody>
        {rows.map((j, i) => <tr key={i} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <td style={{ padding: '9px 12px' }}><IdChip id={j.sd} /></td>
          <td style={{ padding: '9px 12px', fontWeight: 600 }}>{j.title}</td>
          <td style={{ padding: '9px 12px', color: 'hsl(var(--muted-foreground))' }}>{j.client}</td>
          <td style={{ padding: '9px 12px' }}>{j.tech === 'Unassigned' ? <span style={{ color: 'hsl(var(--destructive))' }}>Unassigned</span> : j.tech}</td>
          <td style={{ padding: '9px 12px' }}><SiteTime time={j.time} zone={siteZoneFor(j.client)} small /></td>
          <td style={{ padding: '9px 12px' }}><StatusBadge status={j.state} /></td>
        </tr>)}
        {rows.length === 0 && <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>No visits match this filter.</td></tr>}
      </tbody>
    </table>
  </div>;
}
function CalGateModal({ job, onClose }) {
  const map = { block: ['ban', 'hsl(var(--destructive))', 'Blocked — cannot schedule', 'Resolve the blocker before this visit can be placed on the board.', false],
    warn: ['alert-triangle', 'hsl(var(--warning))', 'Warning — proceed with override', 'You can schedule this visit, but the scheduling engine flagged a risk.', true],
    review: ['help-circle', 'hsl(var(--muted-foreground))', 'Needs review', 'Assign a technician and confirm readiness to schedule.', true] };
  const [ic, c, title, body, canProceed] = map[job.sev] || map.review;
  return <React.Fragment>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'hsl(222 47% 11% / 0.4)', zIndex: 950 }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, maxWidth: '92vw', background: 'hsl(var(--card))', borderRadius: 14, boxShadow: 'var(--shadow-xl)', zIndex: 951, overflow: 'hidden' }}>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'hsl(var(--success))' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--success))' }} />Scheduling Gate · Live</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'inline-flex' }}><Icon name="x" size={17} /></button>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</div>
        <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginBottom: 13 }}>{job.client} · scheduling onto the board</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: `${c.replace(')', ' / 0.1)')}`, border: `1px solid ${c.replace(')', ' / 0.3)')}`, borderRadius: 10, padding: '12px 14px' }}>
          <Icon name={ic} size={18} color={c} style={{ flexShrink: 0, marginTop: 1 }} />
          <div><div style={{ fontSize: 13.5, fontWeight: 600, color: c }}>{title}</div><div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{job.why} — {body}</div></div>
        </div>
        {canProceed && <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 5 }}>Override reason</div>
          <textarea placeholder="Why are you overriding the gate?" style={{ width: '100%', height: 48, border: '1px solid hsl(var(--input))', borderRadius: 8, padding: 9, boxSizing: 'border-box', fontSize: 12.5, fontFamily: 'inherit', resize: 'none' }} />
        </div>}
        <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
          <Button variant="outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>
          <Button variant="primary" icon={canProceed ? 'check' : 'ban'} onClick={onClose} style={{ flex: 1, justifyContent: 'center', ...(canProceed ? {} : { opacity: 0.5, pointerEvents: 'none' }) }}>{canProceed ? 'Override & Schedule' : 'Blocked'}</Button>
        </div>
      </div>
    </div>
  </React.Fragment>;
}

Object.assign(window, { CalendarScreen });
