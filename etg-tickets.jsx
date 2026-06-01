// ETG Dashboard — Service Tickets screen.
const { useState: useStateTk } = React;

function Donut({ segments, total, label }) {
  let acc = 0; const stops = [];
  segments.forEach((s) => { const start = acc / total * 360; acc += s.value; const end = acc / total * 360; stops.push(`${s.color} ${start}deg ${end}deg`); });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: `conic-gradient(${stops.join(',')})`, position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 14, borderRadius: '50%', background: 'hsl(var(--card))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{total}</span><span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }}>{label}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((s, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} /><span style={{ flex: 1 }}>{s.label}</span>
          <span style={{ fontWeight: 600 }}>{s.value}</span><span style={{ color: 'hsl(var(--muted-foreground))', minWidth: 38, textAlign: 'right' }}>({Math.round(s.value / total * 100)}%)</span>
        </div>)}
      </div>
    </div>
  );
}

function Gauge({ pct }) {
  const angle = -90 + (pct / 100) * 180;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 150, height: 78, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: 150, height: 150, borderRadius: '50%', boxSizing: 'border-box',
          background: `conic-gradient(from -90deg, hsl(var(--success)) 0deg ${pct/100*180}deg, hsl(var(--muted)) ${pct/100*180}deg 180deg, transparent 180deg)` }} />
        <div style={{ position: 'absolute', left: 19, top: 19, width: 112, height: 112, borderRadius: '50%', background: 'hsl(var(--card))' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 2, height: 60, background: 'hsl(var(--foreground))', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${angle}deg)` }} />
        <div style={{ position: 'absolute', bottom: -4, left: '50%', width: 10, height: 10, borderRadius: '50%', background: 'hsl(var(--foreground))', transform: 'translateX(-50%)' }} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: 'hsl(var(--success))' }}>{pct}%</div>
      <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Met SLA</div>
    </div>
  );
}

function TkKpiCard({ title, value, sub, icon, color, upcoming }) {
  return (
    <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: upcoming ? 0.55 : 1 }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 6px', letterSpacing: '-0.02em', color: upcoming ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{upcoming ? '—' : value}</div>
        {upcoming ? <UpcomingPill /> : <div style={{ fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}>{sub}</div>}
      </div>
    </div>
  );
}

function ServiceTicketsScreen({ onNewTicket }) {
  const [selected, setSelected] = useStateTk(TICKETS[0].id);
  const ticket = TICKETS.find((t) => t.id === selected);
  return (
    <div>
      <PageHeader title="Service Tickets" description="Track, manage and resolve customer service requests"
        actions={<>
          <Button variant="outline" icon="download">Export</Button>
          <Button variant="outline" icon="filter">Filters</Button>
          <Button variant="primary" icon="plus" onClick={onNewTicket}>New Ticket</Button>
        </>} />
      <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {TICKET_KPIS.map((k, i) => <TkKpiCard key={i} {...k} />)}
      </div>
      <FilterBar search="Search tickets by ID, title, client, site, asset..." filters={['Status: Open, In Progress', 'Priority: All', 'Source: All', 'Client: All', 'Assigned To: All', 'More Filters']} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 330px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              {['Ticket ID', 'Subject', 'Client / Site', 'Asset', 'Priority', 'Status', 'Assigned To', 'Due Date'].map((h, i) =>
                <th key={i} style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 14px' }}>
                  {h === 'Asset' ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>Asset<PreviewPill /></span> : h}</th>)}
            </tr></thead>
            <tbody>
              {TICKETS.map((t) => {
                const isSel = selected === t.id;
                return (
                  <tr key={t.id} onClick={() => setSelected(t.id)} style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent' }}>
                    <td style={{ padding: '11px 14px' }}><IdChip id={t.id} /></td>
                    <td>{t.subject}{t.note && <div style={{ fontSize: 11.5, color: 'hsl(var(--destructive))', marginTop: 1 }}>{t.note}</div>}</td>
                    <td>{t.client}<div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{t.site}</div></td>
                    <td><span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12.5 }}>Assets ({t.assets})</span></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Avatar name={t.assignee} size={24} /><span style={{ fontSize: 12.5 }}>{t.assignee}</span></span></td>
                    <td style={{ fontSize: 12.5, color: t.overdue ? 'hsl(var(--destructive))' : 'inherit', fontWeight: t.overdue ? 600 : 400 }}>{t.due}<div style={{ fontSize: 11.5, color: t.overdue ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))', marginTop: 1 }}>{t.dueT}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '0 14px 8px' }}><Pagination label="Showing 1 to 8 of 23 tickets" /></div>
        </div>
        <TicketDetail ticket={ticket} />
      </div>

      {/* analytics footer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
        <Panel title="Tickets by Priority"><Donut total={23} label="Total" segments={[
          { label: 'High', value: 4, color: 'hsl(var(--destructive))' }, { label: 'Medium', value: 10, color: 'hsl(var(--warning))' }, { label: 'Low', value: 9, color: 'hsl(var(--success))' }]} /></Panel>
        <Panel title="Tickets by Status"><Donut total={23} label="Total" segments={[
          { label: 'Open', value: 11, color: 'hsl(var(--primary))' }, { label: 'In Progress', value: 12, color: 'hsl(var(--info))' }, { label: 'On Hold', value: 5, color: 'hsl(var(--warning))' }]} /></Panel>
        <Panel title="SLA Performance" action={<UpcomingPill />}>
          <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 10, padding: '20px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1, color: 'hsl(var(--muted-foreground))' }}>—</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 9, color: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}><Icon name="loader" size={13} />Calculating…</div>
            <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 7, lineHeight: 1.5 }}>The SLA engine is on the roadmap. Today only ticket <b>Overdue</b> status is tracked.</div>
          </div>
        </Panel>
        <Panel title="Top Issue Types">
          {[['CCTV / Video', 11], ['Access Control', 6], ['Network / Connectivity', 4], ['Intercom', 2], ['Other', 0]].map(([l, v], i) =>
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: i < 4 ? '1px solid hsl(var(--border))' : 'none' }}><span>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>)}
        </Panel>
      </div>
    </div>
  );
}

function TicketTab({ label, active, tag }) {
  return <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
    borderBottom: active ? '2px solid hsl(var(--primary))' : '2px solid transparent', paddingBottom: 8, cursor: 'pointer', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>{label}{tag}</span>;
}
function TicketDetail({ ticket }) {
  const t = ticket;
  return (
    <div style={{ position: 'sticky', top: 0 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <IdChip id={t.id} />
          {t.priority === 'High' && <span style={{ ...statusStyle('overdue'), padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>High Priority</span>}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: '8px 0 10px' }}>{t.subject}</div>
        {/* read-only status area — changes only via action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'hsl(var(--muted) / 0.45)', borderRadius: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Status</span>
          <StatusBadge status={t.status} />
          <PriorityBadge priority={t.priority} />
          <span style={{ marginLeft: 'auto' }}><ReadOnlyTag /></span>
        </div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 5 }}>
          <KV k="Client"><span style={{ color: 'hsl(var(--primary))' }}>{t.client}</span></KV>
          <KV k="Site">{t.site}</KV>
          <KV k="Location">{t.location || t.assetLoc}</KV>
          <KV k="Source">{t.source}</KV>
          <KV k="Asset"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Assets ({t.assets})</span><PreviewPill /></span></KV>
          <KV k="Created">{t.created}, {t.createdT}</KV>
          <KV k="Due Date"><span style={{ color: t.overdue ? 'hsl(var(--destructive))' : 'inherit', fontWeight: t.overdue ? 600 : 500 }}>{t.due}, {t.dueT}</span></KV>
          <KV k="Assigned To"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name={t.assignee} size={20} />{t.assignee}</span></KV>
        </div>
        {/* ownership / routing — auto-router not live */}
        <div style={{ marginTop: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600 }}>Ownership &amp; Routing</span><UpcomingPill /></div>
          <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 9, padding: '11px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Likely Owner</span><span style={{ fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>—</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Business Unit</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}><Icon name="loader" size={12} />Calculating…</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid hsl(var(--border))', margin: '12px -15px 0', padding: '0 15px' }}>
          <TicketTab label="Details" active /><TicketTab label={`Assets (${t.assets})`} tag={<PreviewPill />} /><TicketTab label="Timeline" /><TicketTab label="Notes" /><TicketTab label="Files" />
        </div>
        <div style={{ paddingTop: 13 }}>
          <DetailBlock label="Description">{t.desc || 'No description provided.'}</DetailBlock>
          {t.impact && <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Customer Impact</span>
              <span style={{ ...statusStyle('overdue'), padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>{t.impact}</span></div>
            <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{t.impactNote}</div></div>}
          {t.internal && <DetailBlock label="Internal Notes" style={{ marginTop: 12 }}>{t.internal}</DetailBlock>}
          {t.job && <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Linked Job</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><IdChip id={t.job.split(' – ')[0]} /><span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{t.job.split(' – ')[1]}</span></span></div>}
        </div>
      </Panel>
      <Panel title="Quick Actions" style={{ marginTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['refresh-cw', 'Update Status'], ['message-square-plus', 'Add Note'], ['upload', 'Upload File'], ['briefcase', 'Create Job'], ['arrow-up-circle', 'Escalate Ticket'], ['check-circle-2', 'Close Ticket']].map(([ic, l], i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '9px 10px', fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: 'pointer' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--primary-subtle))'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Icon name={ic} size={14} />{l}</div>)}
        </div>
      </Panel>
    </div>
  );
}
function DetailBlock({ label, children, style }) {
  return <div style={style}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{children}</div></div>;
}

Object.assign(window, { ServiceTicketsScreen });
