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

function TkKpiCard({ title, value, sub, icon, color, upcoming, onClick, active }) {
  const clickable = !!onClick && !upcoming;
  return (
    <div onClick={clickable ? onClick : undefined} style={{ background: active ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', border: `1px solid ${active ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`, borderRadius: 12, padding: 16, boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 13, alignItems: 'flex-start', cursor: clickable ? 'pointer' : 'default' }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, background: KPI_COLORS[color], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: upcoming ? 0.55 : 1 }}><Icon name={icon} size={22} color="#fff" /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>{title}</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1, margin: '3px 0 6px', letterSpacing: '-0.02em', color: upcoming ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{upcoming ? '—' : value}</div>
        {upcoming ? <UpcomingPill /> : <div style={{ fontSize: 12.5, fontWeight: 500, color: 'hsl(var(--primary))', cursor: clickable ? 'pointer' : 'default' }}>{sub}</div>}
      </div>
    </div>
  );
}

function ServiceTicketsScreen({ onNewTicket }) {
  const [previewId, setPreviewId] = useStateTk(null);
  const [previewRect, setPreviewRect] = useStateTk(null);
  const [drawerId, setDrawerId] = useStateTk(null);
  const [savedView, setSavedView] = useStateTk('All');
  const [search, setSearch] = useStateTk('');
  const [fStatus, setFStatus] = useStateTk('All');
  const [fPriority, setFPriority] = useStateTk('All');
  const [fBU, setFBU] = useStateTk('All');
  const [page, setPage] = useStateTk(1);
  const [kpiFilter, setKpiFilter] = useStateTk(null);
  const [statusOv, setStatusOv] = useStateTk({});
  const [assignOv, setAssignOv] = useStateTk({});
  const PER = 8;
  const withOv = (t) => ({ ...t, status: statusOv[t.id] || t.status, assignee: assignOv[t.id] || t.assignee });
  const previewTk = previewId && withOv(TICKETS.find((t) => t.id === previewId));
  const drawerTk = drawerId && withOv(TICKETS.find((t) => t.id === drawerId));
  function openPreview(e, id) { setPreviewId(id); setPreviewRect(e.currentTarget.getBoundingClientRect()); }
  const NEXT_STATUS = { 'Open': 'In Progress', 'In Progress': 'On Hold', 'On Hold': 'Resolved', 'Resolved': 'Open' };
  const ASSIGNEES = ['Brendan Lee', 'Jake Murray', 'Liam Smith', 'Sarah Chen'];
  function cycleStatus(id) { const cur = statusOv[id] || TICKETS.find((t) => t.id === id).status; setStatusOv((m) => ({ ...m, [id]: NEXT_STATUS[cur] || 'Open' })); }
  function cycleAssign(id) { const cur = assignOv[id] || TICKETS.find((t) => t.id === id).assignee; const i = ASSIGNEES.indexOf(cur); setAssignOv((m) => ({ ...m, [id]: ASSIGNEES[(i + 1) % ASSIGNEES.length] })); }

  // KPI → status filter (index-aligned to TICKET_KPIS)
  const KPI_STATUS = ['Open', 'In Progress', 'On Hold', '__overdue', 'Resolved', null];
  const kpiMatch = (t) => { if (!kpiFilter) return true; if (kpiFilter === '__overdue') return t.overdue; return (statusOv[t.id] || t.status) === kpiFilter; };

  const savedMatch = { All: () => true, Overdue: (t) => t.overdue, Unassigned: (t) => (assignOv[t.id] || t.assignee) === 'Unassigned',
    'Needs Review': (t) => t.ownership === 'Needs Review', Recurring: () => false };
  const filtered = TICKETS.map(withOv).filter((t) => {
    if (!(savedMatch[savedView] || (() => true))(t)) return false;
    if (!kpiMatch(t)) return false;
    if (fStatus !== 'All' && t.status !== fStatus) return false;
    if (fPriority !== 'All' && t.priority !== fPriority) return false;
    if (fBU !== 'All' && t.bu !== fBU) return false;
    if (search) { const q = search.toLowerCase(); const hay = `${t.id} ${t.subject} ${t.client} ${t.site} ${t.issueType} ${t.assignee}`.toLowerCase(); if (!hay.includes(q)) return false; }
    return true;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const pg = Math.min(page, pages);
  const rows = filtered.slice((pg - 1) * PER, pg * PER);
  const savedCounts = (key) => TICKETS.filter(savedMatch[key] || (() => true)).length;

  return (
    <div>
      <PageHeader title="Service Tickets" description="Track, manage and resolve customer service requests"
        actions={<>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Button variant="outline" icon="download">Export</Button><UpcomingPill /></span>
          <Button variant="outline" icon="filter">Filters</Button>
          <Button variant="primary" icon="plus" onClick={onNewTicket}>New Ticket</Button>
        </>} />
      <div style={{ marginBottom: 18, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {TICKET_KPIS.map((k, i) => { const f = KPI_STATUS[i];
          return <TkKpiCard key={i} {...k} onClick={f == null ? undefined : () => { setKpiFilter(kpiFilter === f ? null : f); setPage(1); }} active={kpiFilter === f && f != null} />; })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['All', false], [`Needs Review`, true], ['Overdue', false], ['Unassigned', false], ['Recurring', true]].map(([l, up], i) => {
          const on = savedView === l;
          return <span key={i} onClick={() => { setSavedView(l); setPage(1); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 500, padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
            background: on ? 'hsl(var(--primary-subtle))' : 'hsl(var(--card))', color: on ? 'hsl(var(--primary))' : 'hsl(var(--foreground))', border: `1px solid ${on ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border))'}` }}>
            {l}{l !== 'Recurring' && <span style={{ fontSize: 11, fontWeight: 700, color: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>({savedCounts(l)})</span>}{up && <UpcomingPill compact />}</span>;
        })}
      </div>
      <FilterBar search="Search tickets by ID, title, client, site, asset..." searchValue={search} onSearch={(v) => { setSearch(v); setPage(1); }}
        filters={[
          { label: 'Status', value: fStatus, options: ['All', 'Open', 'In Progress', 'On Hold', 'Resolved'], onChange: (v) => { setFStatus(v); setPage(1); } },
          { label: 'Priority', value: fPriority, options: ['All', 'High', 'Medium', 'Low'], onChange: (v) => { setFPriority(v); setPage(1); } },
          { label: 'Business Unit', value: fBU, options: ['All', 'Evolution', 'Localcom', 'Shared'], onChange: (v) => { setFBU(v); setPage(1); } },
        ]} />

      <div onMouseLeave={() => setPreviewId(null)} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              {['Ticket ID', 'Subject', 'Client / Site', 'Asset', 'Priority', 'Status', 'Assigned To', 'Due Date'].map((h, i) =>
                <th key={i} style={{ textAlign: 'left', verticalAlign: 'top', fontWeight: 500, fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '11px 14px' }}>
                  {h === 'Asset' ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>Asset<PreviewPill /></span> : h}</th>)}
            </tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} style={{ padding: '28px 14px', textAlign: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>No tickets match the current filters.</td></tr>}
              {rows.map((t) => {
                const isSel = previewId === t.id;
                return (
                  <tr key={t.id} onMouseEnter={(e) => openPreview(e, t.id)} onClick={(e) => openPreview(e, t.id)} onDoubleClick={() => setDrawerId(t.id)}
                    style={{ borderBottom: '1px solid hsl(var(--border))', cursor: 'pointer', background: isSel ? 'hsl(var(--primary-subtle) / 0.5)' : 'transparent' }}>
                    <td style={{ padding: '11px 14px' }}><IdChip id={t.id} /></td>
                    <td>{t.subject}{t.note && <div style={{ fontSize: 11.5, color: 'hsl(var(--destructive))', marginTop: 1 }}>{t.note}</div>}<div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}><span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.6)', border: '1px solid hsl(var(--border))', padding: '0 6px', borderRadius: 999 }}>{t.issueType}</span>{t.fj && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}><Icon name="briefcase" size={9} />{t.fj}</span>}</div></td>
                    <td>{t.client}<div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{t.site}</div></td>
                    <td><span style={{ color: 'hsl(var(--muted-foreground))', fontSize: 12.5 }}>Assets ({t.assets})</span></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Avatar name={t.assignee} size={24} /><span style={{ fontSize: 12.5 }}>{t.assignee}</span></span></td>
                    <td style={{ fontSize: 12.5, color: t.overdue ? 'hsl(var(--destructive))' : 'inherit', fontWeight: t.overdue ? 600 : 400 }}>{t.due}<div style={{ fontSize: 11.5, marginTop: 1 }}><SiteTime time={t.dueT} zone={siteZoneFor(t.client)} small primaryColor={t.overdue ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))'} /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '0 14px 8px' }}><Pagination label={`Showing ${filtered.length === 0 ? 0 : (pg - 1) * PER + 1} to ${Math.min(pg * PER, filtered.length)} of ${filtered.length} tickets`} page={pg} pages={pages} onPage={setPage} /></div>
      </div>
      {previewTk && <TicketPreview t={previewTk} rect={previewRect} onOpen={() => { setDrawerId(previewTk.id); setPreviewId(null); }} onAssign={() => cycleAssign(previewTk.id)} onStatus={() => cycleStatus(previewTk.id)} />}
      {drawerTk && <TicketDrawer t={drawerTk} onClose={() => setDrawerId(null)} />}

      {/* analytics footer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 16 }}>
        <Panel title="Tickets by Priority"><Donut total={23} label="Total" segments={[
          { label: 'High', value: 4, color: 'hsl(var(--destructive))' }, { label: 'Medium', value: 10, color: 'hsl(var(--warning))' }, { label: 'Low', value: 9, color: 'hsl(var(--success))' }]} /></Panel>
        <Panel title="Tickets by Status"><Donut total={23} label="Total" segments={[
          { label: 'Open', value: 6, color: 'hsl(var(--primary))' }, { label: 'In Progress', value: 12, color: 'hsl(var(--info))' }, { label: 'On Hold', value: 5, color: 'hsl(var(--warning))' }]} /></Panel>
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
  const [tab, setTab] = useStateTk('Details');
  const tabs = ['Details', `Assets (${t.assets})`, 'Timeline', 'Notes', 'Files', 'Customer Messages', 'Related Jobs'];
  const tabTag = { [`Assets (${t.assets})`]: <PreviewPill />, 'Customer Messages': <UpcomingPill />, 'Related Jobs': <UpcomingPill /> };
  return (
    <div style={{ position: 'sticky', top: 0 }}>
      <Panel pad={15}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <IdChip id={t.id} />
          {t.priority === 'High' && <span style={{ ...statusStyle('overdue'), padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>High Priority</span>}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: '8px 0 6px' }}>{t.subject}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ ...statusStyle('draft'), padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>{t.subjectType}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.6)', border: '1px solid hsl(var(--border))', padding: '1px 8px', borderRadius: 999 }}><Icon name="tag" size={11} />{t.issueType}</span>
        </div>
        {/* read-only status area — changes only via action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'hsl(var(--muted) / 0.45)', borderRadius: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Status</span>
          <StatusBadge status={t.status} />
          <PriorityBadge priority={t.priority} />
          <span style={{ marginLeft: 'auto' }}><ReadOnlyTag /></span>
        </div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 5 }}>
          <KV k="Client"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><IdChip id="CLI-000023" /><span style={{ color: 'hsl(var(--primary))' }}>{t.client}</span></span></KV>
          <KV k="Site"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><IdChip id="SITE-000050" />{t.site}</span></KV>
          <KV k="Location">{t.location || t.assetLoc}</KV>
          <KV k="Source">{t.source}</KV>
          <KV k="Issue Type">{t.issueType}</KV>
          <KV k="Reporter"><span style={{ color: 'hsl(var(--muted-foreground))' }}>{t.createdBy || 'Site contact'}</span></KV>
          <KV k="Reporter Phone"><span style={{ color: 'hsl(var(--muted-foreground))' }}>0412 345 678</span></KV>
          <KV k="Reporter Email"><span style={{ color: 'hsl(var(--muted-foreground))' }}>contact@client.com.au</span></KV>
          <KV k="Asset"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><IdChip id="EG-0042" /><span style={{ color: 'hsl(var(--muted-foreground))' }}>Assets ({t.assets})</span><PreviewPill /></span></KV>
          <KV k="Linked Project">{t.prj ? <IdChip id={t.prj} /> : <PendingDash />}</KV>
          <KV k="Cost Centre">{t.cc ? <IdChip id={t.cc} /> : <PendingDash />}</KV>
          <KV k="Created"><span>{t.created}, <SiteTime time={t.createdT} zone={siteZoneFor(t.client)} oneline /></span></KV>
          <KV k="Due Date"><span style={{ color: t.overdue ? 'hsl(var(--destructive))' : 'inherit', fontWeight: t.overdue ? 600 : 500 }}>{t.due}, <SiteTime time={t.dueT} zone={siteZoneFor(t.client)} oneline primaryColor={t.overdue ? 'hsl(var(--destructive))' : undefined} /></span></KV>
          <KV k="Assigned To"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IdChip id="USR-000012" /><Avatar name={t.assignee} size={20} />{t.assignee}</span></KV>
        </div>
        {/* ownership / routing — BU + status real (read-only); only Likely Owner is auto-suggested */}
        <div style={{ marginTop: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600 }}>Ownership &amp; Routing</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--muted-foreground))' }}>Business Unit<ReadOnlyTag compact /></span><span style={{ fontWeight: 600 }}>{t.bu}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'hsl(var(--muted-foreground))' }}>Ownership Status<ReadOnlyTag compact /></span><span style={{ ...statusStyle(t.ownership === 'Needs Review' ? 'medium' : 'active'), padding: '1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{t.ownership}</span></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><span style={{ fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Likely Owner (auto-suggested)</span><UpcomingPill /></div>
          <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 9, padding: '11px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: 'hsl(var(--muted-foreground))' }}>Suggested routing</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}><Icon name="loader" size={12} />Calculating…</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid hsl(var(--border))', margin: '12px -15px 0', padding: '0 15px', flexWrap: 'wrap' }}>
          {tabs.map((l) => <span key={l} onClick={() => setTab(l)}><TicketTab label={l} active={tab === l} tag={tabTag[l]} /></span>)}
        </div>
        <div style={{ paddingTop: 13 }}>
          {tab === 'Details' && <React.Fragment>
          <DetailBlock label="Description">{t.desc || 'No description provided.'}</DetailBlock>
          {t.impact && <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Customer Impact</span>
              {t.impact === 'No impact' ? <PendingDash /> : <span style={{ ...statusStyle(t.impact === 'Safety risk' ? 'overdue' : t.impact === 'Site disrupted' ? 'medium' : 'active'), padding: '1px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>{t.impact}</span>}</div>
            <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{t.impactNote}</div></div>}
          {t.internal && <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}><span style={{ fontSize: 12, fontWeight: 600 }}>Notes</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.7)', border: '1px solid hsl(var(--border))', padding: '1px 7px', borderRadius: 999 }}>Internal only</span></div>
            <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{t.internal}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '10px 0 4px' }}><span style={{ fontSize: 12, fontWeight: 600 }}>Customer-visible note</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'hsl(var(--success))', background: 'hsl(var(--success-subtle))', border: '1px solid hsl(var(--success) / 0.3)', padding: '1px 7px', borderRadius: 999 }}>Customer-visible</span><PreviewPill /></div>
            <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>Technician booked for first available window — we'll confirm the ETA by phone.</div></div>}
          {t.job && <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Job Created</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><IdChip id={t.job.split(' – ')[0]} /><span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{t.job.split(' – ')[1]}</span></span></div>}
          </React.Fragment>}
          {tab.startsWith('Assets') && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Linked assets<PreviewPill /></div>
            {Array.from({ length: Math.min(t.assets, 3) }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 10px' }}>
              <Icon name="cctv" size={15} color="hsl(var(--muted-foreground))" /><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{['Reception Dome Camera', 'Comms Switch', 'Door Reader'][i]}</div><IdChip id={`EG-00${42 + i}`} /></div></div>)}
            {t.assets === 0 && <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>No assets linked to this ticket.</div>}</div>}
          {tab === 'Timeline' && <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[['Ticket created', t.created + ', ' + t.createdT, 'plus'], ['Auto-flagged ' + t.priority + ' priority', t.created, 'flag'], ['Assigned to ' + t.assignee, t.created, 'user'], ['Awaiting technician', '—', 'clock']].map(([a, m, ic], i, arr) =>
              <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: i < arr.length - 1 ? 14 : 0, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ width: 24, height: 24, borderRadius: '50%', background: 'hsl(var(--primary-subtle))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={12} color="hsl(var(--primary))" /></span>{i < arr.length - 1 && <span style={{ flex: 1, width: 1.5, background: 'hsl(var(--border))', marginTop: 2 }} />}</div>
                <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{a}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{m}</div></div></div>)}</div>}
          {tab === 'Notes' && <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ border: '1px solid hsl(var(--border))', borderRadius: 8, padding: 10 }}><div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}><span style={{ fontSize: 11.5, fontWeight: 600 }}>{t.assignee}</span><span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted) / 0.7)', border: '1px solid hsl(var(--border))', padding: '0 6px', borderRadius: 999 }}>Internal only</span></div><div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{t.internal || 'Checked switch and PoE status — scheduling site visit.'}</div></div>
            <textarea placeholder="Add a note…" style={{ width: '100%', height: 56, border: '1px solid hsl(var(--input))', borderRadius: 8, padding: 9, fontSize: 12.5, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none' }} /></div>}
          {tab === 'Files' && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '8px 10px' }}><Icon name="file-text" size={15} color="hsl(var(--info))" /><span style={{ flex: 1, fontSize: 12.5 }}>site-photo-reception.jpg</span><span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>1.8 MB</span></div>
            <div style={{ border: '1.5px dashed hsl(var(--border))', borderRadius: 8, padding: '16px', textAlign: 'center', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Drop files here or click to upload</div></div>}
          {tab === 'Customer Messages' && <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 9, padding: 20, textAlign: 'center' }}><Icon name="messages-square" size={22} color="hsl(var(--muted-foreground))" /><div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 8 }}>Customer messaging is on the roadmap.</div><div style={{ marginTop: 8 }}><UpcomingPill /></div></div>}
          {tab === 'Related Jobs' && <div style={{ border: '1.5px dashed hsl(var(--border))', background: 'hsl(var(--muted) / 0.4)', borderRadius: 9, padding: 20, textAlign: 'center' }}><Icon name="briefcase" size={22} color="hsl(var(--muted-foreground))" /><div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 8 }}>{t.fj ? <span>Linked field job <IdChip id={t.fj} /></span> : 'No related jobs yet.'}</div><div style={{ marginTop: 8 }}><UpcomingPill /></div></div>}
        </div>
      </Panel>
      <Panel title="Quick Actions" style={{ marginTop: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['refresh-cw', 'Update Status', false], ['message-square-plus', 'Add Note', false], ['upload', 'Upload File', false], ['briefcase', 'Create Job', false], ['arrow-up-circle', 'Escalate Ticket', true], ['check-circle-2', 'Close Ticket', false]].map(([ic, l, up], i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '9px 10px', fontSize: 12.5, fontWeight: 500, color: up ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))', cursor: 'pointer' }}>
              <Icon name={ic} size={14} />{l}{up && <span style={{ marginLeft: 'auto' }}><UpcomingPill compact /></span>}</div>)}
        </div>
      </Panel>
    </div>
  );
}
function DetailBlock({ label, children, style }) {
  return <div style={style}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{children}</div></div>;
}

// ---- compact floating preview bubble (hover/click) ----
function PvAction({ icon, label, primary, up, onClick }) {
  return <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: 1, minWidth: 0, height: 32, borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
    border: primary ? 'none' : '1px solid hsl(var(--input))', background: primary ? 'hsl(var(--primary))' : 'hsl(var(--card))', color: primary ? '#fff' : 'hsl(var(--foreground))' }}>
    <Icon name={icon} size={13} />{label}{up && <Icon name="sparkles" size={10} color="hsl(258 70% 60%)" />}</button>;
}
function TicketPreview({ t, rect, onOpen, onAssign, onStatus }) {
  const W = 350;
  const left = rect ? Math.min(rect.left + rect.width * 0.4, window.innerWidth - W - 16) : 200;
  const top = rect ? Math.min(Math.max(rect.top, 12), window.innerHeight - 380) : 80;
  return (
    <div style={{ position: 'fixed', top, left, width: W, zIndex: 800, background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, boxShadow: 'var(--shadow-xl)', padding: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <IdChip id={t.id} />
        {t.priority === 'High' && <span style={{ ...statusStyle('overdue'), padding: '2px 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 600 }}>High Priority</span>}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, margin: '8px 0 9px' }}>{t.subject}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12.5 }}>
        <PvRow k="Client / Site"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ color: 'hsl(var(--primary))' }}>{t.client}</span><span style={{ color: 'hsl(var(--muted-foreground))' }}>· {t.site}</span></span></PvRow>
        <PvRow k="Asset"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IdChip id="EG-0042" /><span style={{ color: 'hsl(var(--muted-foreground))' }}>Assets ({t.assets})</span><PreviewPill /></span></PvRow>
        <PvRow k="Priority / Status"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PriorityBadge priority={t.priority} /><StatusBadge status={t.status} /></span></PvRow>
        <PvRow k="Assigned"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Avatar name={t.assignee} size={20} />{t.assignee}</span></PvRow>
        <PvRow k="Due"><span style={{ color: t.overdue ? 'hsl(var(--destructive))' : 'inherit', fontWeight: t.overdue ? 600 : 400 }}>{t.due}, <SiteTime time={t.dueT} zone={siteZoneFor(t.client)} oneline primaryColor={t.overdue ? 'hsl(var(--destructive))' : undefined} /></span></PvRow>
        <PvRow k="Business Unit"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{t.bu}<ReadOnlyTag compact /></span></PvRow>
        <PvRow k="Job link">{t.fj ? <IdChip id={t.fj} /> : <PendingDash />}</PvRow>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <PvAction icon="external-link" label="Open Ticket" primary onClick={onOpen} />
        <PvAction icon="user-plus" label="Assign" onClick={onAssign} />
        <PvAction icon="refresh-cw" label="Status" onClick={onStatus} />
      </div>
      <div style={{ marginTop: 6 }}><button onClick={onOpen} style={{ width: '100%', height: 30, border: '1px solid hsl(var(--input))', background: 'hsl(var(--card))', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--foreground))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="package" size={13} />View Assets</button></div>
    </div>
  );
}
function PvRow({ k, children }) {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>{k}</span><span style={{ textAlign: 'right' }}>{children}</span></div>;
}

// ---- full ticket drawer (Open Ticket / double-click) ----
function TicketDrawer({ t, onClose }) {
  return (
    <React.Fragment>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'hsl(222 47% 11% / 0.35)', zIndex: 900 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 540, maxWidth: '92vw', background: 'hsl(var(--background))', zIndex: 901, boxShadow: 'var(--shadow-xl)', overflowY: 'auto' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}><span style={{ fontSize: 14, fontWeight: 700 }}>Ticket</span><IdChip id={t.id} /></span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', color: 'hsl(var(--muted-foreground))' }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: '16px 18px 40px' }}><TicketDetail ticket={t} /></div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { ServiceTicketsScreen });
