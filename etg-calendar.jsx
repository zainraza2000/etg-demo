// ETG Dashboard — Calendar (technician scheduling) screen.
const { useState: useStateCal } = React;

const JOB_STATE = {
  'In Progress': { bg: 'hsl(var(--success-subtle))', bar: 'hsl(var(--success))', badge: 'complete' },
  'Planned': { bg: 'hsl(var(--info-subtle))', bar: 'hsl(var(--info))', badge: 'active' },
  'Unassigned': { bg: 'hsl(var(--destructive-subtle))', bar: 'hsl(var(--destructive))', badge: 'overdue' },
};
const TECH_STATE_COLOR = { 'On Site': 'hsl(var(--success))', 'Travelling': 'hsl(var(--warning))', 'On Break': 'hsl(var(--muted-foreground))' };

function JobBlock({ job, selected, onClick }) {
  const s = JOB_STATE[job.state] || JOB_STATE['Planned'];
  const prioColor = { High: 'hsl(var(--destructive))', Medium: 'hsl(var(--warning))', Low: 'hsl(var(--success))' }[job.prio] || 'hsl(var(--muted-foreground))';
  return (
    <div onClick={onClick} style={{ background: s.bg, borderLeft: `3px solid ${s.bar}`, borderRadius: 6, padding: '6px 8px', cursor: 'pointer',
      outline: selected ? `2px solid ${s.bar}` : 'none', boxShadow: selected ? 'var(--shadow-sm)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{job.time}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 600, color: prioColor }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: prioColor }} />{job.prio}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, lineHeight: 1.2 }}>{job.title}</div>
      <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{job.client}</div>
      <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.addr}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5, gap: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}><Icon name="lock" size={9} />{job.sd}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <span style={{ ...statusStyle(s.badge === 'overdue' ? 'overdue' : s.badge === 'complete' ? 'complete' : 'active'), fontSize: 9.5, fontWeight: 600, padding: '1px 6px', borderRadius: 999 }}>{job.state}</span>
          <Icon name="lock" size={9} color="hsl(var(--muted-foreground))" /></span>
      </div>
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
  const CELL = 168;
  return (
    <div>
      <PageHeader title="Calendar" description="Schedule, visits and technician assignments"
        actions={<>
          <Button variant="outline">Today</Button>
          <Button variant="outline" icon="calendar">12 – 18 May 2026</Button>
          <Button variant="outline" icon="filter">Filters</Button>
          <Button variant="primary" icon="plus">New Visit</Button>
        </>} />
      <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {CAL_KPIS.map((k, i) => <CalKpiCard key={i} {...k} />)}
      </div>

      {/* view tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: 'hsl(var(--muted))', borderRadius: 8, padding: 3, gap: 2 }}>
          {[['Week', false], ['Day', false], ['Technicians', true], ['Jobs List', true], ['Map View', true]].map(([t, up], i) =>
            <button key={t} style={{ border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, padding: '6px 11px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              background: i === 0 ? 'hsl(var(--card))' : 'transparent', color: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))', boxShadow: i === 0 ? 'var(--shadow-sm)' : 'none' }}>{t}{up && <UpcomingPill compact />}</button>)}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <SearchInput placeholder="Search jobs, clients, sites..." />
          <Select label="More Filters" />
        </div>
      </div>

      {/* drag-to-schedule gate — the one live engine on this screen */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 10, padding: '10px 14px', marginBottom: 14, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600 }}><Icon name="move" size={15} color="hsl(var(--primary))" />Drag a visit onto a technician / day — the scheduling gate checks it live:</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive-subtle))', border: '1px solid hsl(var(--destructive) / 0.3)', padding: '3px 9px', borderRadius: 999 }}><Icon name="ban" size={13} />Block</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'hsl(var(--warning))', background: 'hsl(var(--warning-subtle))', border: '1px solid hsl(var(--warning) / 0.3)', padding: '3px 9px', borderRadius: 999 }}><Icon name="alert-triangle" size={13} />Warn &amp; proceed</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'hsl(var(--primary))', background: 'hsl(var(--primary-subtle))', border: '1px solid hsl(var(--primary) / 0.3)', padding: '3px 9px', borderRadius: 999 }}><Icon name="shield-check" size={13} />Override with reason</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'hsl(var(--success))', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--success))' }} />Live</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 184 + CELL * 7 }}>
              {/* header */}
              <div style={{ display: 'grid', gridTemplateColumns: `184px repeat(7, ${CELL}px)`, borderBottom: '1px solid hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)' }}>
                <div style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Technicians</div>
                {CAL_DAYS.map((d, i) => { const [dow, ...rest] = d.split(' '); const isToday = i === 2;
                  return <div key={i} style={{ padding: '9px 12px', borderLeft: '1px solid hsl(var(--border))', fontSize: 12.5 }}>
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}>{dow} </span>
                    <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...(isToday ? { background: 'hsl(var(--primary))', color: '#fff', borderRadius: '50%', width: 22, height: 22 } : {}) }}>{rest[0]}</span>
                    <span style={{ color: 'hsl(var(--muted-foreground))' }}> {rest[1]}</span></div>; })}
              </div>
              {/* tech rows */}
              {TECHS.map((tech, ti) => (
                <div key={ti} style={{ display: 'grid', gridTemplateColumns: `184px repeat(7, ${CELL}px)`, borderBottom: '1px solid hsl(var(--border))', minHeight: 96 }}>
                  <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Avatar name={tech.name} size={30} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>{tech.name}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: TECH_STATE_COLOR[tech.state], display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: TECH_STATE_COLOR[tech.state] }} />{tech.state}</span>
                        <UpcomingPill compact />
                      </div>
                      <div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span>{tech.jobs} jobs · <span style={{ color: 'hsl(var(--muted-foreground) / 0.7)' }}>{tech.hrs} hrs</span></span><PreviewPill />
                      </div>
                    </div>
                  </div>
                  {CAL_DAYS.map((_, di) => {
                    const job = (CAL_JOBS[ti] || []).find((j) => j.day === di);
                    return <div key={di} style={{ borderLeft: '1px solid hsl(var(--border))', padding: 5 }}>
                      {job && <JobBlock job={job} selected={sel === `${ti}-${di}`} onClick={() => setSel(`${ti}-${di}`)} />}</div>;
                  })}
                </div>
              ))}
              {/* unassigned lane */}
              <div style={{ display: 'grid', gridTemplateColumns: `184px repeat(7, ${CELL}px)`, minHeight: 96, background: 'hsl(var(--destructive-subtle) / 0.3)' }}>
                <div style={{ padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'hsl(var(--muted))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user-x" size={15} color="hsl(var(--muted-foreground))" /></span>
                  <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>Unassigned Jobs</div><div style={{ fontSize: 10.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>3 jobs</div></div>
                </div>
                {CAL_DAYS.map((_, di) => { const job = CAL_UNASSIGNED.find((j) => j.day === di);
                  return <div key={di} style={{ borderLeft: '1px solid hsl(var(--border))', padding: 5 }}>
                    {job && <JobBlock job={job} selected={sel === `u-${di}`} onClick={() => setSel(`u-${di}`)} />}</div>; })}
              </div>
            </div>
          </div>
          {/* legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '11px 16px', borderTop: '1px solid hsl(var(--border))', flexWrap: 'wrap' }}>
            {[['In Progress', 'hsl(var(--success))'], ['Planned', 'hsl(var(--info))'], ['Travelling', 'hsl(var(--warning))'], ['On Break', 'hsl(var(--muted-foreground))'], ['Unassigned', 'hsl(var(--destructive))'], ['Completed', 'hsl(var(--success))']].map(([l, c], i) =>
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />{l}</span>)}
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Show weekends
              <span style={{ width: 34, height: 19, borderRadius: 999, background: 'hsl(var(--primary))', position: 'relative' }}><span style={{ position: 'absolute', top: 2, right: 2, width: 15, height: 15, borderRadius: '50%', background: '#fff' }} /></span></span>
          </div>
        </div>

        {/* job detail */}
        <JobDetail />
      </div>
    </div>
  );
}

function JobDetail() {
  return (
    <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Visit Details</h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><StatusBadge status="In Progress" /><ReadOnlyTag /></span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: '9px 0 1px' }}>CCTV Upgrade</div>
        <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>ABC Corporate</div>
        <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginBottom: 11 }}>Level 1, 123 George St, Sydney NSW</div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['calendar', 'Mon 12 May 2026'], ['clock', '8:00 AM – 12:00 PM'], ['user', 'Brendan Lee'], ['video', 'CCTV']].map(([ic, l], i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5 }}><Icon name={ic} size={14} color="hsl(var(--muted-foreground))" />{l}</div>)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 2 }}>
            <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Visit</span><IdChip id="SD-000091" />
            <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginLeft: 4 }}>Job</span><IdChip id="FJ-000310" />
          </div>
        </div>
        <div style={{ marginTop: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 600 }}>Visit Progress<UpcomingPill /></span>
            <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Pending</span>
          </div>
          <div style={{ height: 7, background: 'hsl(var(--muted))', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: '100%', background: 'repeating-linear-gradient(90deg, hsl(var(--border)) 0 6px, transparent 6px 12px)' }} /></div>
          <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['On Site', 'Work In Progress', 'Testing', 'Handover', 'Complete'].map((l, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'hsl(var(--muted-foreground))' }}><Icon name="circle" size={15} color="hsl(var(--muted-foreground))" />{l}</span>
                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Pending</span></div>)}
          </div>
          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 9, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="info" size={12} />Live progress arrives with the technician mobile clock-in.</div>
        </div>
      </Panel>
      <Panel title="Client Contact" action={<PreviewPill />}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>ABC Corporate</div>
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

Object.assign(window, { CalendarScreen });
