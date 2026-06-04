// ETG Technician Portal — screens, lifecycle/clock state machine, mount.
// Layout contract: every screen is a full-height flex column —
//   [ sticky header (flexShrink:0) ][ scroll (flex:1, minHeight:0) ][ footer ]
// so headers + action bar stay pinned and only the middle scrolls.
const { useState: useStateMA, useEffect: useEffectMA } = React;

const M_TECH = 'Brendan Lee';
const PORTAL_KEY = 'etg_portal_v3';
const TODAY_LABEL = 'Friday, 5 June 2026';

const HEADER = { flexShrink: 0, background: 'hsl(var(--card))', borderBottom: '1px solid hsl(var(--border))', padding: '56px 16px 12px' };
const SCROLL = { flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' };
const SCREEN = { height: '100%', display: 'flex', flexDirection: 'column', background: 'hsl(var(--background))' };
const PAD = { padding: '18px 16px 28px' };

const UP_NEXT = [
  { day: 'Tomorrow · Fri 6 Jun', start: '8:30 AM', title: 'NVR Install', where: 'Retail Group · Store 47', zone: 'Australia/Sydney' },
  { day: 'Tomorrow · Fri 6 Jun', start: '1:00 PM', title: 'Camera Reposition', where: 'ABC Corporate · Level 3', zone: 'Australia/Sydney' },
  { day: 'Mon 9 Jun', start: '9:00 AM', title: 'Access Control Service', where: 'Fusion Mfg · Factory 1', zone: 'Australia/Adelaide' },
];

// ---- state seed ------------------------------------------------------------
function initJs() {
  const o = {};
  MJOBS.forEach((j) => { o[j.id] = { state: 'Offered', clockStart: null, clockedSec: 0, checks: {}, photos: {}, materials: j.materials.map((m) => ({ ...m })), notes: '', signed: false, blockedReason: null, submitted: false, assets: {}, travelMin: 0, breakMin: 0, ot: false, tsNotes: '' }; });
  return o;
}
function loadJs() { try { const r = JSON.parse(localStorage.getItem(PORTAL_KEY)); if (r && r.js) return r.js; } catch (e) {} return initJs(); }

// ---- enforcement: what's left before a job can complete --------------------
function outstandingFor(job, j) {
  const out = [];
  job.checklists.forEach((g) => { const checks = j.checks[g.key] || {}; const left = g.items.filter((it, i) => it.req && !checks[i]).length; if (left) out.push({ icon: g.icon, label: `${g.label} — ${left} required left` }); });
  job.photosReq.forEach(({ cat, req }) => { if (req && !(j.photos[cat] > 0)) out.push({ icon: 'camera', label: `Photo required: ${cat}` }); });
  if (!j.signed) out.push({ icon: 'pen-line', label: 'Client sign-off' });
  return out;
}
function assetMissing(job, j) { return job.assets.some(([eg]) => { const a = j.assets[eg]; return !(a && (a.installed || a.serial)); }); }

// ---- the persistent bottom action bar --------------------------------------
function ActionBar({ job, j, ctx }) {
  const s = j.state;
  const wrap = { flexShrink: 0, background: 'hsl(var(--card))', borderTop: '1px solid hsl(var(--border))', padding: '12px 16px 28px' };
  if (s === 'Blocked') return <div style={wrap}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}><Icon name="octagon-alert" size={16} color="hsl(var(--destructive))" /><span style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--destructive))' }}>Blocked · {j.blockedReason}</span></div>
    <MBtn variant="outline" full icon="rotate-ccw" onClick={() => ctx.unblock(job.id)}>Resume — issue resolved</MBtn></div>;
  if (s === 'Offered') return <div style={wrap}><MBtn variant="primary" full icon="check" onClick={() => ctx.accept(job.id)}>Accept job</MBtn></div>;
  if (s === 'Accepted') return <div style={wrap}><MBtn variant="primary" full icon="navigation" onClick={() => ctx.setStage(job.id, 'Travelling')}>Start travel to site</MBtn></div>;
  if (s === 'Travelling') return <div style={wrap}><MBtn variant="primary" full icon="map-pin" onClick={() => ctx.setStage(job.id, 'On site')}>Arrive on site</MBtn></div>;
  if (s === 'On site') return <div style={wrap}>
    <MBtn variant="success" full icon="play" onClick={() => ctx.clockOn(job.id)} style={{ marginBottom: 9 }}>Clock on &amp; start work</MBtn>
    <MBtn variant="ghost" full size="sm" icon="octagon-alert" onClick={() => ctx.setBlockedFor(job.id)}>Mark blocked</MBtn></div>;
  if (s === 'In progress') { const n = outstandingFor(job, j).length;
    return <div style={wrap}>
      <MBtn variant="success" full icon="square-check" onClick={() => ctx.attemptComplete(job.id)} style={{ marginBottom: 9 }}>Clock off &amp; complete{n > 0 && <span style={{ fontWeight: 600, opacity: 0.85 }}>· {n} left</span>}</MBtn>
      <div style={{ display: 'flex', gap: 9 }}><MBtn variant="ghost" full size="sm" icon="pause" onClick={() => ctx.pause(job.id)}>Pause</MBtn><MBtn variant="ghost" full size="sm" icon="octagon-alert" onClick={() => ctx.setBlockedFor(job.id)}>Blocked</MBtn></div></div>; }
  if (s === 'Paused') return <div style={wrap}>
    <MBtn variant="success" full icon="play" onClick={() => ctx.resume(job.id)} style={{ marginBottom: 9 }}>Resume work</MBtn>
    <MBtn variant="ghost" full size="sm" icon="octagon-alert" onClick={() => ctx.setBlockedFor(job.id)}>Mark blocked</MBtn></div>;
  if (s === 'Complete') return <div style={wrap}><MBtn variant="primary" full icon="send" onClick={() => ctx.submitTs(job.id)}>Submit timesheet · {mHm(j.clockedSec)}</MBtn></div>;
  if (s === 'Submitted') return <div style={wrap}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 52, borderRadius: 12, background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))', fontSize: 15, fontWeight: 700 }}><Icon name="circle-check-big" size={19} />Timesheet submitted</div></div>;
  return null;
}

// ---- clock card ------------------------------------------------------------
function ClockCard({ j, elapsed }) {
  const live = j.state === 'In progress';
  const show = ['In progress', 'Paused', 'Complete', 'Submitted'].includes(j.state) || j.clockedSec > 0;
  if (!show) return null;
  const label = live ? 'On the clock' : j.state === 'Paused' ? 'Paused' : 'Labour logged';
  return <div style={{ marginBottom: 18, borderRadius: 14, padding: 16, background: live ? 'hsl(var(--success) / 0.06)' : 'hsl(var(--card))', border: `1px solid ${live ? 'hsl(var(--success) / 0.3)' : 'hsl(var(--border))'}` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: live ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))' }}>
        {live && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'hsl(var(--success))' }} />}{label}</span>
      <Icon name="clock" size={16} color="hsl(var(--muted-foreground))" /></div>
    <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.05, color: live ? 'hsl(var(--success))' : 'hsl(var(--foreground))' }}>{mFmtDur(elapsed)}</div>
    <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 6 }}>Labour is billed from your actual clock time — not the scheduled start.</div>
  </div>;
}

// ---- time breakdown (gap 2) ------------------------------------------------
function Stepper({ value, onChange, suffix }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <button className="m-press" onClick={() => onChange(Math.max(0, value - 15))} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="minus" size={16} /></button>
    <span style={{ minWidth: 64, textAlign: 'center', fontSize: 15.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{value}{suffix}</span>
    <button className="m-press" onClick={() => onChange(value + 15)} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={16} /></button>
  </div>;
}
function TimeBreakdown({ job, j, ctx }) {
  const row = (label, sub, control) => <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid hsl(var(--border))' }}>
    <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{sub}</div></div>{control}</div>;
  return <MCard pad={16}>
    {row('Travel', 'To and from site', <Stepper value={j.travelMin} onChange={(v) => ctx.setTime(job.id, 'travelMin', v)} suffix="m" />)}
    {row('Labour', 'From your clock', <span style={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{mHm(ctx.elapsed(job.id))}</span>)}
    {row('Break', 'Unpaid', <Stepper value={j.breakMin} onChange={(v) => ctx.setTime(job.id, 'breakMin', v)} suffix="m" />)}
    <div style={{ paddingTop: 12 }}><MToggle on={j.ot} onChange={(v) => ctx.setTime(job.id, 'ot', v)} label="Overtime" sub={j.ot ? 'Flagged for payroll review' : 'Flag if this ran into overtime'} /></div>
    <div style={{ marginTop: 12 }}><MLabel>Timesheet note</MLabel><textarea value={j.tsNotes} onChange={(e) => ctx.setTime(job.id, 'tsNotes', e.target.value)} placeholder="Anything payroll should know…" style={{ ...M_INPUT, minHeight: 60, padding: 12, resize: 'none' }} /></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}><Icon name="info" size={13} />Feeds payroll &amp; job costing in the office.</div>
  </MCard>;
}

// ---- materials list (gap 4: note + receipt) --------------------------------
function MaterialsList({ j, onAddOpen }) {
  return <div>
    {j.materials.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
      {j.materials.map((m, i) => <MCard key={i} pad={12}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 600 }}>{m.name}</div>{m.note && <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{m.note}</div>}</div>
          {m.receipt && <Icon name="receipt" size={15} color="hsl(var(--muted-foreground))" />}
          <span style={{ fontSize: 14.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{m.qty}</span>
          <span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', minWidth: 44 }}>{m.unit}</span>
        </div>
      </MCard>)}
    </div>}
    <MBtn variant="outline" full icon="plus" onClick={onAddOpen}>Add material used</MBtn>
  </div>;
}

// ---- linked assets (gap 1 entry) -------------------------------------------
function AssetList({ job, j, onOpen }) {
  return <MCard pad={6}>
    {job.assets.map(([eg, name, model], i) => { const a = j.assets[eg]; const done = a && (a.installed || a.serial);
      return <button key={eg} className="m-press" onClick={() => onOpen([eg, name, model])} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', padding: '11px 10px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', borderBottom: i < job.assets.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: 'hsl(var(--primary) / 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="cctv" size={17} color="hsl(var(--primary))" /></span>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div><div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}>{eg}</div></div>
        {done
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'hsl(var(--success))' }}><Icon name="check" size={13} />Updated</span>
          : <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--warning))' }}>Update</span>}
        <Icon name="chevron-right" size={16} color="hsl(var(--muted-foreground))" /></button>; })}
  </MCard>;
}

// ---- job screen ------------------------------------------------------------
function JobScreen({ job, ctx }) {
  const j = ctx.js[job.id];
  const out = outstandingFor(job, j);
  const totalReq = job.checklists.reduce((n, g) => n + g.items.filter((it) => it.req).length, 0);
  const doneReq = job.checklists.reduce((n, g) => { const c = j.checks[g.key] || {}; return n + g.items.filter((it, i) => it.req && c[i]).length; }, 0);
  return <div style={SCREEN}>
    <div style={HEADER}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
        <button className="m-press" onClick={() => ctx.setOpenJob(null)} aria-label="Back" style={{ border: 'none', background: 'hsl(var(--muted))', width: 38, height: 38, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Icon name="chevron-left" size={20} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</div>
          <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}>{job.id}</div>
        </div>
        <MStatePill state={j.state} />
      </div>
      <Lifecycle state={j.state} />
    </div>

    <div style={{ ...SCROLL, ...PAD }}>
      <ClockCard j={j} elapsed={ctx.elapsed(job.id)} />

      {/* customer & site */}
      <MCard pad={16} style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{job.client}</span><MPrio p={job.priority} /></div>
        <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>{job.site}</div>
        <div style={{ marginTop: 6 }}>
          <MInfoRow icon="clock" label="Scheduled" value={<SiteTime time={job.time} zone={job.zone} small />} />
          <MInfoRow icon="map-pin" label="Site address" value={job.address} action="navigation" onAction={() => ctx.flash('Opening maps…')} />
          <MInfoRow icon="user" label={job.role} value={job.contact} action="phone" onAction={() => ctx.flash('Calling ' + job.contact + '…')} />
          <MInfoRow icon="mail" label="Email" value={job.email} action="mail" onAction={() => ctx.flash('Emailing ' + job.contact + '…')} last />
        </div>
      </MCard>

      <MSection title="The job">
        <MCard pad={16}>
          <div style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 12 }}>{job.desc}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {job.scope.map((s, i) => <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, lineHeight: 1.4 }}><Icon name="check" size={15} color="hsl(var(--primary))" style={{ flexShrink: 0, marginTop: 1 }} /><span>{s}</span></div>)}
          </div>
        </MCard>
      </MSection>

      <MSection title="Access & safety">
        <MCard pad={16}>
          <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{job.access}</div>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginTop: 12, padding: '11px 12px', borderRadius: 11, background: 'hsl(var(--warning) / 0.08)', border: '1px solid hsl(var(--warning) / 0.25)' }}>
            <Icon name="triangle-alert" size={16} color="hsl(var(--warning))" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{job.safetyNote}</span></div>
        </MCard>
      </MSection>

      <MSection title="Checklists" right={<span style={{ fontSize: 11.5, fontWeight: 700, color: doneReq === totalReq ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))' }}>{doneReq}/{totalReq} required</span>}>
        {job.checklists.map((g) => <MCheckGroup key={g.key} group={g} checks={j.checks[g.key] || {}} onToggle={(i) => ctx.toggle(job.id, g.key, i)} />)}
      </MSection>

      <MSection title="Photos" right={<span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Proof of work</span>}>
        <MCard pad={16}><MPhotoGrid job={job} j={j} onAdd={(cat) => ctx.addPhoto(job.id, cat)} /></MCard>
      </MSection>

      <MSection title="Materials used" count={j.materials.length}>
        <MaterialsList j={j} onAddOpen={() => ctx.setMatFor(job.id)} />
      </MSection>

      <MSection title="Time breakdown"><TimeBreakdown job={job} j={j} ctx={ctx} /></MSection>

      <MSection title="Client sign-off">
        {j.signed ? <MCard pad={14} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'hsl(var(--success) / 0.07)', border: '1px solid hsl(var(--success) / 0.3)' }}>
          <Icon name="circle-check-big" size={20} color="hsl(var(--success))" />
          <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>Signed by {job.contact}</div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>Captured on site</div></div></MCard>
          : <MBtn variant="outline" full icon="pen-line" onClick={() => ctx.setSignFor(job.id)}>Capture client signature</MBtn>}
      </MSection>

      <MSection title="Linked assets" count={job.assets.length}><AssetList job={job} j={j} onOpen={(a) => ctx.setAssetFor({ id: job.id, asset: a })} /></MSection>

      <MSection title="Notes for the office">
        <textarea value={j.notes} onChange={(e) => ctx.setNotes(job.id, e.target.value)} placeholder="Add any notes for the office…" style={{ ...M_INPUT, minHeight: 84, padding: 13, resize: 'none' }} />
      </MSection>

      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 13px', borderRadius: 11, background: 'hsl(var(--muted) / 0.5)', border: '1px dashed hsl(var(--border))' }}>
        <Icon name="lock" size={15} color="hsl(var(--muted-foreground))" />
        <span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Pricing, margin &amp; supplier costs are hidden on the field portal.</span></div>
    </div>

    <ActionBar job={job} j={j} ctx={ctx} />
  </div>;
}

// ---- today screen ----------------------------------------------------------
function TodayScreen({ ctx }) {
  const onClock = MJOBS.find((job) => ctx.js[job.id].state === 'In progress');
  const alerts = [];
  MJOBS.forEach((job) => { const j = ctx.js[job.id];
    if (j.state === 'Complete' && !j.submitted) alerts.push([job.id, 'send', 'Timesheet not submitted', job.title]);
    if (['In progress', 'Paused'].includes(j.state)) {
      if (job.photosReq.some(({ cat, req }) => req && !(j.photos[cat] > 0))) alerts.push([job.id, 'camera', 'Photos required', job.title]);
      if (outstandingFor(job, j).some((o) => o.label.includes('required left'))) alerts.push([job.id, 'list-checks', 'Checklist incomplete', job.title]);
      if (assetMissing(job, j)) alerts.push([job.id, 'box', 'Asset details missing', job.title]);
      if (!j.signed) alerts.push([job.id, 'pen-line', 'Client sign-off required', job.title]);
    }
  });
  return <div style={SCREEN}>
    <div style={HEADER}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={M_TECH} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>G'day, {M_TECH.split(' ')[0]}</div>
          <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))' }}>{TODAY_LABEL} · {MJOBS.length} jobs</div></div>
      </div>
    </div>

    <div style={{ ...SCROLL, ...PAD }}>
      {onClock && <MCard onClick={() => ctx.setOpenJob(onClock.id)} pad={16} style={{ marginBottom: 22, background: 'hsl(var(--success) / 0.07)', border: '1px solid hsl(var(--success) / 0.3)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: 'hsl(var(--success))' }} /><span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--success))' }}>On the clock</span><Icon name="chevron-right" size={18} color="hsl(var(--success))" style={{ marginLeft: 'auto' }} /></div>
        <div style={{ fontSize: 34, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', margin: '8px 0 2px', color: 'hsl(var(--success))' }}>{mFmtDur(ctx.elapsed(onClock.id))}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{onClock.title} · {onClock.client}</div>
      </MCard>}

      {alerts.length > 0 && <MSection title="Needs your attention" count={alerts.length}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map(([id, icon, label, sub], i) => <button key={i} className="m-press" onClick={() => ctx.setOpenJob(id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 13px', borderRadius: 12, border: '1px solid hsl(var(--warning) / 0.28)', background: 'hsl(var(--warning) / 0.07)', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            <Icon name={icon} size={18} color="hsl(var(--warning))" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div><div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{sub}</div></div>
            <Icon name="chevron-right" size={16} color="hsl(var(--muted-foreground))" /></button>)}
        </div>
      </MSection>}

      <MSection title="Today's jobs" count={MJOBS.length}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {MJOBS.map((job) => { const j = ctx.js[job.id];
            const verb = j.state === 'Offered' ? 'Accept' : j.state === 'Submitted' ? 'View' : j.state === 'Complete' ? 'Submit' : (j.state === 'Accepted' || j.state === 'Travelling' || j.state === 'On site') ? 'Continue' : 'Open';
            const accent = j.state === 'Blocked' ? 'hsl(var(--destructive))' : j.state === 'In progress' ? 'hsl(var(--success))' : null;
            return <MCard key={job.id} onClick={() => ctx.setOpenJob(job.id)} pad={14} style={{ cursor: 'pointer', boxShadow: accent ? `inset 3px 0 0 ${accent}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}><SiteTime time={job.start} zone={job.zone} small primaryColor="hsl(var(--muted-foreground))" /></span>
                <span style={{ marginLeft: 'auto', flexShrink: 0 }}><MStatePill state={j.state} /></span>
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 800, marginBottom: 2 }}>{job.title}</div>
              <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginBottom: 12 }}>{job.client} · {job.site}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 11, borderTop: '1px solid hsl(var(--border))' }}>
                <MPrio p={job.priority} />
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 700, color: 'hsl(var(--primary))' }}>{verb}<Icon name="arrow-right" size={15} /></span>
              </div>
            </MCard>; })}
        </div>
      </MSection>

      <MSection title="Up next">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {UP_NEXT.map((u, i) => <MCard key={i} pad={13}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>{u.title}</div><div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{u.where}</div></div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{u.day.replace('Tomorrow · ', '')}</div><div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))' }}>{u.start}</div></div>
            </div>
          </MCard>)}
        </div>
      </MSection>
    </div>
  </div>;
}

// ---- schedule screen -------------------------------------------------------
function ScheduleScreen() {
  const days = [['Tomorrow · Fri 6 Jun', UP_NEXT.filter((u) => u.day.includes('Fri 6'))], ['Mon 9 Jun', UP_NEXT.filter((u) => u.day.includes('Mon 9'))]];
  return <div style={SCREEN}>
    <div style={HEADER}><div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Schedule</div><div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>Your upcoming jobs</div></div>
    <div style={{ ...SCROLL, ...PAD }}>
      {days.map(([label, jobs]) => <MSection key={label} title={label}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.map((u, i) => <MCard key={i} pad={14}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}><span style={{ fontVariantNumeric: 'tabular-nums' }}><SiteTime time={u.start} zone={u.zone} small primaryColor="hsl(var(--muted-foreground))" /></span><span style={{ marginLeft: 'auto' }}><MStatePill state="Not started" /></span></div>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{u.title}</div><div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{u.where}</div></MCard>)}
        </div>
      </MSection>)}
    </div>
  </div>;
}

// ---- timesheet screen (gap 2 surfaced) -------------------------------------
function TimesheetScreen({ ctx }) {
  let labour = 0, travel = 0, brk = 0;
  const rows = MJOBS.map((job) => { const j = ctx.js[job.id]; const sec = ctx.elapsed(job.id); labour += sec; travel += (j.travelMin || 0) * 60; brk += (j.breakMin || 0) * 60; return [job, j, sec]; });
  const stat = (label, val, color) => <div style={{ flex: 1, textAlign: 'center' }}>
    <div style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: color || 'hsl(var(--foreground))' }}>{val}</div>
    <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'hsl(var(--muted-foreground))', marginTop: 3 }}>{label}</div></div>;
  return <div style={SCREEN}>
    <div style={HEADER}><div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Timesheet</div><div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>2 – 8 June 2026 · captured from your clock</div></div>
    <div style={{ ...SCROLL, ...PAD }}>
      <MCard pad={18} style={{ marginBottom: 22, textAlign: 'center' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))' }}>Labour today</div>
        <div style={{ fontSize: 44, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', margin: '4px 0 14px' }}>{mHm(labour)}</div>
        <div style={{ display: 'flex', borderTop: '1px solid hsl(var(--border))', paddingTop: 14 }}>
          {stat('Labour', mHm(labour))}{stat('Travel', mMinsHm(travel / 60), 'hsl(var(--warning))')}{stat('Break', mMinsHm(brk / 60), 'hsl(var(--muted-foreground))')}
        </div>
      </MCard>
      <MSection title="By job">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {rows.map(([job, j, sec]) => <MCard key={job.id} pad={13}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: (j.travelMin || j.breakMin || j.ot) ? 9 : 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>{job.title}</div><div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}>{job.id}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{mHm(sec)}</div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: j.submitted ? 'hsl(var(--success))' : sec > 0 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))' }}>{j.submitted ? 'Submitted' : sec > 0 ? 'Draft' : '—'}</div></div>
            </div>
            {(j.travelMin || j.breakMin || j.ot) > 0 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 9, borderTop: '1px solid hsl(var(--border))' }}>
              {j.travelMin > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Travel {j.travelMin}m</span>}
              {j.breakMin > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>· Break {j.breakMin}m</span>}
              {j.ot && <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--warning))' }}>· OT flagged</span>}</div>}
          </MCard>)}
        </div>
      </MSection>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 13px', borderRadius: 11, background: 'hsl(var(--muted) / 0.5)', border: '1px dashed hsl(var(--border))' }}>
        <Icon name="info" size={15} color="hsl(var(--muted-foreground))" />
        <span style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Labour is captured from your clock-on / clock-off — submit from each job.</span></div>
    </div>
  </div>;
}

// ---- profile screen --------------------------------------------------------
function ProfileScreen() {
  const can = ['Your assigned jobs & schedule', 'Job details, scope, access & safety', 'Your clock, photos, checklists & notes', 'Materials & assets you worked on', 'Your own timesheets'];
  const cant = ['Sell price, margin or profit', 'Supplier invoice costs', "Other technicians' jobs or pay", 'Company financials & admin settings'];
  const list = (items, icon, color) => <MCard pad={6}>{items.map((c, i) => <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '11px 8px', borderBottom: i < items.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}><Icon name={icon} size={16} color={color} style={{ flexShrink: 0 }} /><span style={{ fontSize: 13.5, color: color === 'hsl(var(--muted-foreground))' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))' }}>{c}</span></div>)}</MCard>;
  return <div style={SCREEN}>
    <div style={HEADER}><div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Profile</div></div>
    <div style={{ ...SCROLL, ...PAD }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <Avatar name={M_TECH} size={56} />
        <div><div style={{ fontSize: 20, fontWeight: 800 }}>{M_TECH}</div><div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>Technician · <span style={{ fontFamily: 'var(--font-mono)' }}>USR-000012</span></div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 11, fontWeight: 700, color: 'hsl(var(--primary))', background: 'hsl(var(--primary) / 0.1)', padding: '3px 9px', borderRadius: 7 }}><Icon name="shield" size={12} />Field portal access</div></div>
      </div>
      <MSection title="You can see">{list(can, 'circle-check-big', 'hsl(var(--success))')}</MSection>
      <MSection title="Hidden from this portal">{list(cant, 'lock', 'hsl(var(--muted-foreground))')}</MSection>
      <MBtn variant="outline" full icon="log-out">Sign out</MBtn>
    </div>
  </div>;
}

// ---- root ------------------------------------------------------------------
function PortalApp() {
  const [tab, setTab] = useStateMA('today');
  const [openJob, setOpenJob] = useStateMA(null);
  const [js, setJs] = useStateMA(loadJs);
  const [now, setNow] = useStateMA(Date.now());
  const [toast, setToast] = useStateMA(null);
  const [blockedFor, setBlockedFor] = useStateMA(null);
  const [signFor, setSignFor] = useStateMA(null);
  const [matFor, setMatFor] = useStateMA(null);
  const [assetFor, setAssetFor] = useStateMA(null);
  const [completeInfo, setCompleteInfo] = useStateMA(null);
  useEffectMA(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffectMA(() => { try { localStorage.setItem(PORTAL_KEY, JSON.stringify({ js })); } catch (e) {} }, [js]);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 2400); };
  const upd = (id, patch) => setJs((s) => ({ ...s, [id]: { ...s[id], ...(typeof patch === 'function' ? patch(s[id]) : patch) } }));
  const elapsed = (id) => { const j = js[id]; let s = j.clockedSec || 0; if (j.clockStart) s += (now - j.clockStart) / 1000; return s; };
  const ctx = {
    js, now, elapsed, openJob, setOpenJob, setBlockedFor, setSignFor, setMatFor, setAssetFor, flash,
    accept: (id) => upd(id, { state: 'Accepted' }),
    setStage: (id, state) => upd(id, { state }),
    clockOn: (id) => upd(id, { state: 'In progress', clockStart: Date.now() }),
    pause: (id) => upd(id, (j) => ({ state: 'Paused', clockedSec: j.clockedSec + (j.clockStart ? (Date.now() - j.clockStart) / 1000 : 0), clockStart: null })),
    resume: (id) => upd(id, { state: 'In progress', clockStart: Date.now() }),
    toggle: (id, key, i) => upd(id, (j) => ({ checks: { ...j.checks, [key]: { ...(j.checks[key] || {}), [i]: !(j.checks[key] || {})[i] } } })),
    addPhoto: (id, cat) => upd(id, (j) => ({ photos: { ...j.photos, [cat]: (j.photos[cat] || 0) + 1 } })),
    addMaterial: (id, m) => upd(id, (j) => ({ materials: [...j.materials, m] })),
    saveAsset: (id, eg, data) => upd(id, (j) => ({ assets: { ...j.assets, [eg]: data } })),
    setTime: (id, key, v) => upd(id, { [key]: v }),
    setNotes: (id, v) => upd(id, { notes: v }),
    unblock: (id) => upd(id, { state: 'On site', blockedReason: null }),
    submitTs: (id) => { upd(id, { state: 'Submitted', submitted: true }); flash('Timesheet submitted to the office'); },
    attemptComplete: (id) => {
      const job = MJOBS.find((x) => x.id === id); const j = js[id]; const out = outstandingFor(job, j);
      if (out.length) { setCompleteInfo({ id, outstanding: out }); return; }
      upd(id, (s) => ({ state: 'Complete', clockedSec: s.clockedSec + (s.clockStart ? (Date.now() - s.clockStart) / 1000 : 0), clockStart: null }));
      flash('Job complete — submit your timesheet');
    },
  };
  const job = openJob && MJOBS.find((x) => x.id === openJob);
  return <IOSDevice>
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background: 'hsl(var(--background))', overflow: 'hidden' }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {job ? <JobScreen job={job} ctx={ctx} /> : (
          tab === 'today' ? <TodayScreen ctx={ctx} /> :
          tab === 'schedule' ? <ScheduleScreen /> :
          tab === 'timesheet' ? <TimesheetScreen ctx={ctx} /> :
          <ProfileScreen />
        )}
      </div>
      {!job && <MTabBar active={tab} onChange={setTab} />}

      <BlockedSheet open={!!blockedFor} onClose={() => setBlockedFor(null)} onPick={(r) => { upd(blockedFor, (j) => ({ state: 'Blocked', blockedReason: r, clockedSec: j.clockedSec + (j.clockStart ? (Date.now() - j.clockStart) / 1000 : 0), clockStart: null })); setBlockedFor(null); flash('Marked blocked — office notified'); }} />
      <SignSheet open={!!signFor} onClose={() => setSignFor(null)} contact={job && job.contact} onSign={() => { upd(signFor, { signed: true }); setSignFor(null); flash('Signature captured'); }} />
      <AddMaterialSheet open={!!matFor} onClose={() => setMatFor(null)} onAdd={(m) => { ctx.addMaterial(matFor, m); setMatFor(null); flash('Material added'); }} />
      <AssetSheet open={!!assetFor} onClose={() => setAssetFor(null)} asset={assetFor && assetFor.asset} data={assetFor && js[assetFor.id].assets[assetFor.asset[0]]} onFlash={flash} onSave={(data) => { ctx.saveAsset(assetFor.id, assetFor.asset[0], data); setAssetFor(null); flash('Asset details saved'); }} />
      <CompleteBlockedSheet open={!!completeInfo} onClose={() => setCompleteInfo(null)} outstanding={completeInfo ? completeInfo.outstanding : []} />

      {toast && <div style={{ position: 'absolute', bottom: 102, left: 16, right: 16, zIndex: 90, background: 'hsl(var(--sidebar))', color: '#fff', borderRadius: 12, padding: '13px 15px', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 10px 34px hsl(222 47% 11% / 0.35)' }}><Icon name="circle-check-big" size={17} color="hsl(var(--success))" />{toast}</div>}
    </div>
  </IOSDevice>;
}

ReactDOM.createRoot(document.getElementById('portal-root')).render(<PortalApp />);
