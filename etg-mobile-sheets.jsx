// ETG Technician Portal — bottom sheets + shared display components.
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

// ---- bottom sheet shell ----------------------------------------------------
function Sheet({ open, onClose, title, sub, children }) {
  if (!open) return null;
  return <React.Fragment>
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'hsl(222 47% 11% / 0.45)', zIndex: 80, borderRadius: 48 }} />
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 81, background: 'hsl(var(--card))', borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -12px 40px hsl(222 47% 11% / 0.22)', maxHeight: '86%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0, padding: '10px 18px 12px', borderBottom: '1px solid hsl(var(--border))' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}><span style={{ width: 38, height: 5, borderRadius: 99, background: 'hsl(var(--border))' }} /></div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div><div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>{sub && <div style={{ fontSize: 12.5, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{sub}</div>}</div>
          <button className="m-press" onClick={onClose} aria-label="Close" style={{ border: 'none', background: 'hsl(var(--muted))', width: 34, height: 34, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}><Icon name="x" size={18} /></button>
        </div>
      </div>
      <div style={{ overflowY: 'auto', padding: '16px 18px 26px' }}>{children}</div>
    </div>
  </React.Fragment>;
}

// ---- safety sub-form (P2) — inline, only for higher-risk items -------------
const POE_METHODS = ['Switch port disabled', 'Injector unplugged', 'Breaker isolated', 'Patch lead removed'];
function SafetyForm({ onConfirm }) {
  const [method, setMethod] = useStateS(''); const [photo, setPhoto] = useStateS(false); const [confirm, setConfirm] = useStateS(false); const [notes, setNotes] = useStateS('');
  const ok = method && photo && confirm;
  return <div style={{ marginTop: 8, padding: 12, borderRadius: 11, background: 'hsl(var(--warning) / 0.06)', border: '1px solid hsl(var(--warning) / 0.3)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}><Icon name="shield-alert" size={15} color="hsl(var(--warning))" /><span style={{ fontSize: 12.5, fontWeight: 700, color: 'hsl(28 80% 38%)' }}>PoE isolation — confirm before swap</span></div>
    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>Isolation method <span style={{ color: 'hsl(var(--destructive))' }}>*</span></div>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 11 }}>
      {POE_METHODS.map((m) => <button key={m} className="m-press" onClick={() => setMethod(m)} style={{ fontSize: 12, fontWeight: 600, padding: '7px 11px', borderRadius: 9, cursor: 'pointer', fontFamily: 'var(--font-sans)', border: `1px solid ${method === m ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`, background: method === m ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--card))', color: method === m ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>{m}</button>)}
    </div>
    <button className="m-press" onClick={() => setPhoto(true)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', minHeight: 44, padding: '0 12px', borderRadius: 10, marginBottom: 9, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, border: `1px solid ${photo ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--border))'}`, background: photo ? 'hsl(var(--success) / 0.07)' : 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}>
      <Icon name={photo ? 'check' : 'camera'} size={16} color={photo ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'} />{photo ? 'Isolation photo captured' : 'Photo of isolation point *'}</button>
    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes if unable to isolate…" style={{ ...M_INPUT, minHeight: 46, padding: 10, fontSize: 13, resize: 'none', marginBottom: 9 }} />
    <button className="m-press" onClick={() => setConfirm(!confirm)} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left', minHeight: 44, padding: '0 12px', borderRadius: 10, marginBottom: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, border: `1px solid ${confirm ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--border))'}`, background: confirm ? 'hsl(var(--success) / 0.07)' : 'hsl(var(--card))' }}>
      <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: confirm ? 'hsl(var(--success))' : 'transparent', border: confirm ? 'none' : '2px solid hsl(var(--border))' }}>{confirm && <Icon name="check" size={14} color="#fff" />}</span>
      I confirm PoE is isolated and safe to work</button>
    <MBtn variant="success" full size="sm" icon="check" disabled={!ok} onClick={onConfirm}>Confirm &amp; mark done</MBtn>
  </div>;
}

// ---- checklist group (typed; green / red / orange states) ------------------
function MCheckGroup({ group, checks, onToggle }) {
  const [formOpen, setFormOpen] = useStateS(null);
  const reqLeft = group.items.filter((it, i) => it.req && !checks[i]).length;
  return <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 8px' }}>
      <Icon name={group.icon} size={15} color="hsl(var(--muted-foreground))" />
      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{group.label}</span>
      {reqLeft > 0
        ? <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'hsl(var(--destructive))' }}>{reqLeft} required left</span>
        : <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'hsl(var(--success))' }}><Icon name="check" size={12} />Done</span>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {group.items.map((it, i) => { const on = !!checks[i]; const warn = it.warn && !on;
        const stroke = on ? 'hsl(var(--success) / 0.4)' : warn ? 'hsl(var(--warning) / 0.45)' : it.req ? 'hsl(var(--destructive) / 0.28)' : 'hsl(var(--border))';
        const bg = on ? 'hsl(var(--success) / 0.07)' : warn ? 'hsl(var(--warning) / 0.06)' : 'hsl(var(--card))';
        const box = on ? 'hsl(var(--success))' : warn ? 'hsl(var(--warning))' : 'transparent';
        const isForm = it.form && !on;
        const expanded = formOpen === i;
        return <div key={i}>
          <button className="m-press" onClick={() => { if (isForm) { setFormOpen(expanded ? null : i); } else { onToggle(i); } }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', minHeight: 50, padding: '8px 13px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', border: `1px solid ${stroke}`, background: bg }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: box, border: box === 'transparent' ? '2px solid hsl(var(--border))' : 'none' }}>{on ? <Icon name="check" size={16} color="#fff" /> : isForm ? <Icon name="shield-alert" size={14} color="hsl(var(--warning))" /> : null}</span>
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>{it.label}</span>
            {!on && (it.req
              ? <span style={{ fontSize: 10, fontWeight: 700, color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.1)', padding: '2px 7px', borderRadius: 999, flexShrink: 0 }}>{isForm ? 'Form' : 'Required'}</span>
              : warn ? <span style={{ fontSize: 10, fontWeight: 700, color: 'hsl(28 80% 40%)', background: 'hsl(var(--warning) / 0.14)', padding: '2px 7px', borderRadius: 999, flexShrink: 0 }}>Can proceed</span>
              : <span style={{ fontSize: 10, fontWeight: 600, color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>Optional</span>)}
          </button>
          {isForm && expanded && <SafetyForm onConfirm={() => { onToggle(i); setFormOpen(null); }} />}
        </div>; })}
    </div>
  </div>;
}

// ---- photo grid (flat tiles, no gradient) ----------------------------------
function MPhotoGrid({ job, j, onAdd }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {job.photosReq.map(({ cat, req }) => { const n = j.photos[cat] || 0; const need = req && n === 0;
      return <div key={cat}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700 }}>{cat}</span>
          {need ? <span style={{ fontSize: 10.5, fontWeight: 700, color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.1)', padding: '2px 8px', borderRadius: 999 }}>Required</span>
            : n > 0 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'hsl(var(--success))', background: 'hsl(var(--success) / 0.12)', padding: '2px 8px', borderRadius: 999 }}><Icon name="check" size={11} />{n}</span>
              : <span style={{ fontSize: 10.5, fontWeight: 600, color: 'hsl(var(--muted-foreground))' }}>Optional</span>}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Array.from({ length: n }).map((_, i) => <div key={i} style={{ width: 76, height: 76, borderRadius: 12, background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="image" size={22} color="hsl(var(--muted-foreground))" />
            <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: 'hsl(var(--success))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={10} color="#fff" /></span>
          </div>)}
          <button className="m-press" onClick={() => onAdd(cat)} style={{ width: 76, height: 76, borderRadius: 12, border: `1.5px dashed ${need ? 'hsl(var(--destructive) / 0.5)' : 'hsl(var(--border))'}`, background: need ? 'hsl(var(--destructive) / 0.05)' : 'hsl(var(--card))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: need ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-sans)' }}>
            <Icon name="camera" size={21} /><span style={{ fontSize: 10.5, fontWeight: 700 }}>Capture</span></button>
        </div>
      </div>; })}
  </div>;
}

// ---- blocked-reason sheet --------------------------------------------------
function BlockedSheet({ open, onClose, onPick }) {
  return <Sheet open={open} onClose={onClose} title="Mark job blocked" sub="Pick a reason — the office is notified straight away.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {BLOCK_REASONS.map((r) => <button key={r} className="m-press" onClick={() => onPick(r)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', minHeight: 54, padding: '0 14px', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: 'hsl(var(--destructive) / 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="octagon-alert" size={16} color="hsl(var(--destructive))" /></span>
        <span style={{ flex: 1 }}>{r}</span><Icon name="chevron-right" size={17} color="hsl(var(--muted-foreground))" /></button>)}
    </div>
  </Sheet>;
}

// ---- can't-clock-off (enforcement) -----------------------------------------
function CompleteBlockedSheet({ open, onClose, outstanding }) {
  return <Sheet open={open} onClose={onClose} title="A few things first" sub="You can clock off once these are done.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {outstanding.map((o, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 12, background: 'hsl(var(--destructive) / 0.06)', border: '1px solid hsl(var(--destructive) / 0.2)' }}>
        <Icon name={o.icon} size={18} color="hsl(var(--destructive))" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 14.5, fontWeight: 600 }}>{o.label}</span></div>)}
    </div>
    <div style={{ marginTop: 16 }}><MBtn variant="outline" full icon="arrow-left" onClick={onClose}>Back to the job</MBtn></div>
  </Sheet>;
}

// ---- pre-start gate (P2) — grouped, complete inline, then clock on ---------
function PrestartGateSheet({ open, job, j, ctx, onClose, onClockOn }) {
  if (!open || !job) return null;
  const groups = job.checklists.filter((g) => g.key === 'prestart' || g.key === 'safety');
  const left = groups.reduce((n, g) => { const c = j.checks[g.key] || {}; return n + g.items.filter((it, i) => it.req && !c[i]).length; }, 0);
  return <Sheet open={open} onClose={onClose} title="Before you clock on" sub={left ? `Complete ${left} required item${left > 1 ? 's' : ''} to start work.` : 'All pre-start checks done — you can clock on.'}>
    {groups.map((g) => <MCheckGroup key={g.key} group={g} checks={j.checks[g.key] || {}} onToggle={(i) => ctx.toggle(job.id, g.key, i)} />)}
    <div style={{ marginTop: 6 }}>
      {left > 0
        ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 52, borderRadius: 12, background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', fontSize: 14.5, fontWeight: 700, justifyContent: 'center' }}><Icon name="lock" size={17} />Resolve {left} blocker{left > 1 ? 's' : ''} to clock on</div>
        : <MBtn variant="success" full icon="play" onClick={onClockOn}>Clock on &amp; start work</MBtn>}
    </div>
  </Sheet>;
}

// ---- break / pause reason (P5) — required pick -----------------------------
function BreakReasonSheet({ open, onClose, onPick }) {
  return <Sheet open={open} onClose={onClose} title="Pause / break" sub="Pick a reason — labour pauses while you're on break.">
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {BREAK_REASONS.map((r) => { const ic = r === 'Meal break' ? 'utensils' : r.startsWith('Waiting for access') ? 'key' : r.startsWith('Waiting for materials') ? 'package' : r === 'Client delay' ? 'user-round' : 'building-2';
        return <button key={r} className="m-press" onClick={() => onPick(r)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', minHeight: 54, padding: '0 14px', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'hsl(var(--foreground))' }}>
          <span style={{ width: 32, height: 32, borderRadius: 9, background: 'hsl(var(--warning) / 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={16} color="hsl(var(--warning))" /></span>
          <span style={{ flex: 1 }}>{r}</span><Icon name="chevron-right" size={17} color="hsl(var(--muted-foreground))" /></button>; })}
    </div>
  </Sheet>;
}

// ---- time adjustment request (P5) — the only way to correct time -----------
function AdjustSheet({ open, onClose, onSubmit }) {
  const [field, setField] = useStateS(''); const [reason, setReason] = useStateS(''); const [photo, setPhoto] = useStateS(false);
  useEffectS(() => { if (open) { setField(''); setReason(''); setPhoto(false); } }, [open]);
  const ok = field && reason.trim();
  return <Sheet open={open} onClose={onClose} title="Request time adjustment" sub="Goes to admin / payroll for approval — times aren't edited directly.">
    <div style={{ marginBottom: 14 }}><MLabel req>What needs changing?</MLabel>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{ADJUST_FIELDS.map((f) => <button key={f} className="m-press" onClick={() => setField(f)} style={{ fontSize: 13, fontWeight: 600, padding: '9px 13px', borderRadius: 10, cursor: 'pointer', fontFamily: 'var(--font-sans)', border: `1px solid ${field === f ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`, background: field === f ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--card))', color: field === f ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>{f}</button>)}</div>
    </div>
    <div style={{ marginBottom: 14 }}><MLabel req>Reason</MLabel>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Clocked on late — was on site from 8:00, system shows 8:15." style={{ ...M_INPUT, minHeight: 76, padding: 12, resize: 'none' }} /></div>
    <div style={{ marginBottom: 18 }}><MToggle on={photo} onChange={setPhoto} label="Attach note / photo" sub={photo ? 'Evidence attached' : 'Optional'} /></div>
    <MBtn variant="primary" icon="send" full disabled={!ok} onClick={() => onSubmit({ field, reason: reason.trim(), photo, status: 'Submitted for approval' })}>Submit for approval</MBtn>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', lineHeight: 1.45 }}><Icon name="info" size={13} style={{ flexShrink: 0 }} />Admin / payroll review every adjustment before it changes your hours.</div>
  </Sheet>;
}

// ---- client signature ------------------------------------------------------
function SignSheet({ open, onClose, onSign, contact }) {
  const ref = useRefS(null);
  const drawing = useRefS(false);
  const [has, setHas] = useStateS(false);
  useEffectS(() => { if (open) { setHas(false); const c = ref.current; if (c) { const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height); x.lineWidth = 2.5; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#0F172A'; } } }, [open]);
  function pos(e) { const c = ref.current; const r = c.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: (t.clientX - r.left) * (c.width / r.width), y: (t.clientY - r.top) * (c.height / r.height) }; }
  function down(e) { e.preventDefault(); drawing.current = true; const x = ref.current.getContext('2d'); const p = pos(e); x.beginPath(); x.moveTo(p.x, p.y); }
  function move(e) { if (!drawing.current) return; e.preventDefault(); const x = ref.current.getContext('2d'); const p = pos(e); x.lineTo(p.x, p.y); x.stroke(); if (!has) setHas(true); }
  function up() { drawing.current = false; }
  function clear() { const c = ref.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); setHas(false); }
  return <Sheet open={open} onClose={onClose} title="Client sign-off" sub={contact ? `Hand the phone to ${contact} to confirm the work.` : 'Confirm the work is complete.'}>
    <canvas ref={ref} width={620} height={260} onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onTouchStart={down} onTouchMove={move} onTouchEnd={up}
      style={{ width: '100%', height: 190, background: 'hsl(var(--muted) / 0.5)', border: '1.5px dashed hsl(var(--border))', borderRadius: 14, touchAction: 'none', cursor: 'crosshair' }} />
    <div style={{ textAlign: 'center', fontSize: 12, color: 'hsl(var(--muted-foreground))', margin: '8px 0 14px' }}>{has ? 'Looks good — capture below.' : 'Sign in the box above.'}</div>
    <div style={{ display: 'flex', gap: 10 }}>
      <MBtn variant="ghost" icon="eraser" onClick={clear}>Clear</MBtn>
      <MBtn variant="success" icon="check" full disabled={!has} onClick={onSign}>Capture signature</MBtn>
    </div>
  </Sheet>;
}

// ---- add material (P4) — search/scan-first, Source-driven, smart save ------
// Derived line status + evidence requirement come from source × match.
function matLineStatus(source, manual, receipt) {
  if (source === 'Van stock' || source === 'Office stock') return manual ? { label: 'Manual item — needs review', tone: 'warning' } : { label: 'Matched to stock', tone: 'active' };
  if (source === 'Supplier pickup') return { label: 'Ready for invoice matching', tone: 'complete' };
  if (source === 'Purchased for job') return receipt ? { label: 'Ready for invoice matching', tone: 'complete' } : { label: 'Receipt required', tone: 'destructive' };
  if (source === 'Client supplied') return { label: 'Client supplied — no cost', tone: 'draft' };
  return manual ? { label: 'Manual item — needs review', tone: 'warning' } : { label: 'Matched to stock', tone: 'active' };
}
function evidenceRequired(source, manual, highValue) { return source === 'Purchased for job' || (manual && highValue); }
function AddMaterialSheet({ open, onClose, onAdd }) {
  const [name, setName] = useStateS(''); const [manual, setManual] = useStateS(false); const [matched, setMatched] = useStateS(false);
  const [qty, setQty] = useStateS(''); const [unit, setUnit] = useStateS('each');
  const [source, setSource] = useStateS('Van stock'); const [note, setNote] = useStateS('');
  const [receipt, setReceipt] = useStateS(false); const [highValue, setHighValue] = useStateS(false);
  useEffectS(() => { if (open) { setName(''); setManual(false); setMatched(false); setQty(''); setUnit('each'); setSource('Van stock'); setNote(''); setReceipt(false); setHighValue(false); } }, [open]);
  const qtyNum = parseFloat(qty); const qtyOk = qtyNum > 0; const largeQty = qtyNum >= 50;
  const evidNeeded = evidenceRequired(source, manual, highValue);
  const noteNeeded = manual; // manual item ⇒ note required
  const status = matLineStatus(source, manual, receipt);
  const missing = !name.trim() || !qtyOk || (evidNeeded && !receipt) || (noteNeeded && !note.trim());
  const btnLabel = missing ? 'Complete required fields' : manual ? 'Add material for review' : 'Add verified material';
  const btnVariant = missing ? 'outline' : manual ? 'primary' : 'success';
  function pickResult(label, isManual) { setName(label); setManual(isManual); setMatched(!isManual); }
  return <Sheet open={open} onClose={onClose} title="Add material used" sub="Captured for job costing, stock & supplier-invoice matching.">
    {/* 1 · Material — search / scan first */}
    <div style={{ marginBottom: 16 }}><MLabel req>Material</MLabel>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <Icon name="search" size={17} color="hsl(var(--muted-foreground))" style={{ position: 'absolute', left: 12, top: 15 }} />
        <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setManual(false); setMatched(false); }} placeholder="Search stock, supplier item, or scan barcode" style={{ ...M_INPUT, height: 48, paddingLeft: 38 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: name && !matched && !manual ? 10 : 0 }}>
        <MBtn variant="outline" full size="sm" icon="scan-barcode" onClick={() => { pickResult('Cat6 cable (ETG stock)', false); setSource('Van stock'); }}>Scan barcode</MBtn>
        <MBtn variant="outline" full size="sm" icon="pencil" onClick={() => pickResult(name || 'Manual item', true)}>Manual item</MBtn>
      </div>
      {/* mock search results */}
      {name && !matched && !manual && <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        {[['Cat6 cable — 305m box', 'ETG stock', 'box'], ['Cat6 cable', 'Van stock', 'metres'], ['Cat6 patch lead 2m', 'Supplier item · Dicker Data', 'each']].map(([n, src, u], i) =>
          <button key={i} className="m-press" onClick={() => { pickResult(n, false); setUnit(u); setSource(src.startsWith('Supplier') ? 'Supplier pickup' : src.startsWith('ETG') ? 'Office stock' : 'Van stock'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', minHeight: 46, padding: '0 12px', borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            <Icon name="package" size={15} color="hsl(var(--muted-foreground))" /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{src}</div></div><Icon name="plus" size={15} color="hsl(var(--primary))" /></button>)}
      </div>}
      {(matched || manual) && <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, fontSize: 12, fontWeight: 600, color: manual ? 'hsl(28 80% 40%)' : 'hsl(var(--success))' }}><Icon name={manual ? 'triangle-alert' : 'check'} size={13} />{manual ? 'Manual item — will be flagged for review' : 'Matched to catalogue item'}</div>}
    </div>
    {/* 2 · Quantity */}
    <div style={{ display: 'flex', gap: 10, marginBottom: 4 }}>
      <div style={{ flex: 1 }}><MLabel req>Quantity</MLabel><MInput value={qty} onChange={setQty} placeholder="0" inputMode="decimal" /></div>
      <div style={{ flex: 1 }}><MLabel req>Unit</MLabel><MSelect value={unit} onChange={setUnit} options={M_UNITS} /></div>
    </div>
    {qty !== '' && !qtyOk && <FieldValidity ok={false} text="Quantity must be more than 0" />}
    {largeQty && <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '8px 0 0', padding: '8px 11px', borderRadius: 9, background: 'hsl(var(--warning) / 0.08)', border: '1px solid hsl(var(--warning) / 0.28)', fontSize: 12, fontWeight: 600, color: 'hsl(28 80% 38%)' }}><Icon name="triangle-alert" size={13} />Large quantity — double-check {qtyNum} {unit}.</div>}
    {/* 3 · Source */}
    <div style={{ margin: '16px 0 4px' }}><MLabel req>Source</MLabel><MChips value={source} options={MAT_SOURCES} onChange={setSource} /></div>
    <div style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', marginBottom: 16, marginTop: 6, lineHeight: 1.45 }}>{
      { 'Van stock': 'Deducts from your van stock.', 'Office stock': 'Deducts from ETG office stock.', 'Supplier pickup': 'Will match against a supplier invoice.', 'Purchased for job': 'Receipt required — matches a supplier invoice.', 'Client supplied': 'Recorded with no cost to ETG.' }[source]
    }</div>
    {/* 4 · Note */}
    <div style={{ marginBottom: 16 }}><MLabel req={noteNeeded}>Note {noteNeeded ? '' : <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>}</MLabel>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={noteNeeded ? 'Required for manual items — describe the item…' : 'e.g. used on the reception runs'} style={{ ...M_INPUT, minHeight: 56, padding: 12, resize: 'none', borderColor: noteNeeded && !note.trim() ? 'hsl(var(--destructive) / 0.5)' : 'hsl(var(--input))' }} /></div>
    {/* 5 · Evidence — only when required */}
    {evidNeeded && <div style={{ marginBottom: 16 }}>
      <MToggle on={receipt} onChange={setReceipt} label="Receipt / photo *" sub={receipt ? 'Evidence attached' : (source === 'Purchased for job' ? 'Required for purchased items' : 'Required for high-value items')} />
      {manual && <button className="m-press" onClick={() => setHighValue(!highValue)} style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Icon name={highValue ? 'check-square' : 'square'} size={13} />High-value / serialised item</button>}
    </div>}
    {manual && !evidNeeded && <button className="m-press" onClick={() => setHighValue(true)} style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}><Icon name="square" size={13} />Mark as high-value / serialised (needs a photo)</button>}
    {/* derived line status preview */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}><span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Line status:</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: `hsl(var(--status-${status.tone}))`, background: `hsl(var(--status-${status.tone}) / 0.12)`, border: `1px solid hsl(var(--status-${status.tone}) / 0.28)`, padding: '2px 9px', borderRadius: 999 }}>{status.label}</span></div>
    <MBtn variant={btnVariant} icon={missing ? 'circle-alert' : 'check'} full disabled={missing} onClick={() => onAdd({ name: name.trim(), qty: qtyNum, unit, source, note: note.trim(), receipt, manual, status: status.label, tone: status.tone })}>{btnLabel}</MBtn>
  </Sheet>;
}

// ---- asset update (P3) — smart verification + verdict + smart save ---------
const MAC_RE = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
const USED_SERIALS = ['DS-2CD-0001USED']; // backend lookup (demo): serial already on another asset
function FieldValidity({ ok, warn, text }) {
  const c = ok ? 'hsl(var(--success))' : warn ? 'hsl(28 80% 40%)' : 'hsl(var(--destructive))';
  return <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11.5, fontWeight: 600, color: c }}>
    <Icon name={ok ? 'check' : warn ? 'triangle-alert' : 'circle-alert'} size={12} />{text}</div>;
}
function AssetSheet({ open, onClose, asset, data, onSave, onFlash }) {
  const [installed, setInstalled] = useStateS(false);
  const [serial, setSerial] = useStateS(''); const [mac, setMac] = useStateS('');
  const [condition, setCondition] = useStateS('Good'); const [notes, setNotes] = useStateS('');
  const [photo, setPhoto] = useStateS(false); const [qr, setQr] = useStateS(false);
  useEffectS(() => { if (open && data) { setInstalled(!!data.installed); setSerial(data.serial || ''); setMac(data.mac || ''); setCondition(data.condition || 'Good'); setNotes(data.notes || ''); setPhoto(!!data.photo); setQr(!!data.qr); } else if (open) { setInstalled(false); setSerial(''); setMac(''); setCondition('Good'); setNotes(''); setPhoto(false); setQr(false); } }, [open, asset && asset[0]]);
  if (!asset) return null;
  // ---- derived validity (backend would own these rules) ----
  const noteNeeded = condition === 'Poor' || condition === 'Faulty';
  const serialV = !serial.trim() ? { st: 'block', t: 'Serial number: required' } : USED_SERIALS.includes(serial.trim()) ? { st: 'warn', t: 'Serial already used on another asset' } : { st: 'ok', t: 'Serial number: valid' };
  const macV = !mac.trim() ? { st: 'warn', t: 'MAC address: recommended for this device' } : MAC_RE.test(mac.trim()) ? { st: 'ok', t: 'MAC address: valid format' } : { st: 'block', t: 'MAC address: invalid format' };
  const qrV = qr ? { st: 'ok', t: `QR code: matched to ${asset[0]}` } : { st: 'block', t: 'QR code: scan required' };
  const photoV = photo ? { st: 'ok', t: 'Asset photo: captured' } : { st: 'block', t: 'Asset photo: required' };
  const instV = installed ? { st: 'ok', t: 'Install confirmed' } : { st: 'block', t: 'Install confirmation: required' };
  const noteV = noteNeeded && !notes.trim() ? { st: 'block', t: `Condition: ${condition} — note required` } : noteNeeded ? { st: 'ok', t: 'Condition note: provided' } : null;
  const checks = [instV, serialV, macV, qrV, photoV].concat(noteV ? [noteV] : []);
  const blockers = checks.filter((c) => c.st === 'block');
  const warns = checks.filter((c) => c.st === 'warn');
  const formatBad = macV.st === 'block';
  const missingReq = blockers.some((b) => /required|scan required/.test(b.t));
  const verdict = blockers.length ? 'Blocked' : warns.length ? 'Warning' : 'Verified';
  const vMap = {
    Verified: { c: 'var(--success)', icon: 'shield-check', msg: 'All required details entered and matched.' },
    Warning: { c: 'var(--warning)', icon: 'triangle-alert', msg: warns[0] ? warns[0].t + '.' : 'Entered, but something needs a look.' },
    Blocked: { c: 'var(--destructive)', icon: 'shield-alert', msg: (blockers[0] ? blockers[0].t : 'Required details missing or invalid') + '.' },
  }[verdict];
  const btnLabel = verdict === 'Verified' ? 'Save verified asset' : verdict === 'Warning' ? 'Review asset mismatch' : formatBad && !missingReq ? 'Fix invalid details' : 'Complete required fields';
  const btnVariant = verdict === 'Verified' ? 'success' : verdict === 'Warning' ? 'primary' : 'outline';
  const canSave = verdict !== 'Blocked';
  return <Sheet open={open} onClose={onClose} title={asset[1]} sub={`${asset[0]} · ${asset[2] || 'Linked asset'}`}>
    {/* verdict banner */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px', borderRadius: 12, marginBottom: 16, background: `hsl(${vMap.c} / 0.09)`, border: `1px solid hsl(${vMap.c} / 0.3)` }}>
      <Icon name={vMap.icon} size={19} color={`hsl(${vMap.c})`} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}><div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 800, color: `hsl(${vMap.c})` }}>{verdict}{verdict !== 'Verified' && <span style={{ fontSize: 10.5, fontWeight: 700, background: `hsl(${vMap.c} / 0.15)`, padding: '1px 7px', borderRadius: 999 }}>{blockers.length || warns.length}</span>}</div>
        <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 2, lineHeight: 1.4 }}>{vMap.msg}</div></div>
    </div>
    <div style={{ marginBottom: 14 }}><MToggle on={installed} onChange={setInstalled} label="Confirm installed *" sub={installed ? 'Marked as installed on site' : 'Tap once fitted and powered'} />{!installed && <FieldValidity {...{ ok: false }} text={instV.t} />}</div>
    <div style={{ marginBottom: 14 }}><MLabel req>Serial number</MLabel><MInput value={serial} onChange={setSerial} placeholder="e.g. DS-2CD-7732NXI" mono /><FieldValidity ok={serialV.st === 'ok'} warn={serialV.st === 'warn'} text={serialV.t} /></div>
    <div style={{ marginBottom: 14 }}><MLabel>MAC address <span style={{ fontWeight: 400, textTransform: 'none' }}>(if applicable)</span></MLabel><MInput value={mac} onChange={setMac} placeholder="e.g. 44:19:B6:7A:2C:01" mono /><FieldValidity ok={macV.st === 'ok'} warn={macV.st === 'warn'} text={macV.t} /></div>
    <div style={{ marginBottom: 14 }}><MLabel req>Condition</MLabel><MChips value={condition} options={M_CONDITIONS} onChange={setCondition} />{noteV && <FieldValidity ok={noteV.st === 'ok'} text={noteV.t} />}</div>
    <div style={{ marginBottom: 14 }}><MLabel req={noteNeeded}>Service notes</MLabel>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={noteNeeded ? 'Required — describe the fault / damage…' : 'Anything the office should know…'} style={{ ...M_INPUT, minHeight: 70, padding: 12, resize: 'none', borderColor: noteNeeded && !notes.trim() ? 'hsl(var(--destructive) / 0.5)' : 'hsl(var(--input))' }} /></div>
    <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
      <MBtn variant={photo ? 'subtle' : 'outline'} full icon={photo ? 'check' : 'camera'} onClick={() => { setPhoto(true); onFlash && onFlash('Asset photo captured'); }}>{photo ? 'Photo added' : 'Asset photo *'}</MBtn>
      <MBtn variant={qr ? 'subtle' : 'outline'} full icon={qr ? 'check' : 'qr-code'} onClick={() => { setQr(true); onFlash && onFlash('QR matched — ' + asset[0]); }}>{qr ? 'QR matched' : 'Scan QR *'}</MBtn>
    </div>
    <div style={{ display: 'flex', gap: 14, marginBottom: 16, padding: '0 2px' }}>
      <FieldValidity ok={photoV.st === 'ok'} text={photoV.t} /><FieldValidity ok={qrV.st === 'ok'} text={qrV.t} />
    </div>
    {/* completion-gate hook */}
    {verdict !== 'Verified' && <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 10, marginBottom: 14, background: 'hsl(var(--muted) / 0.6)', border: '1px dashed hsl(var(--border))' }}>
      <Icon name="lock" size={14} color="hsl(var(--muted-foreground))" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 11.5, color: 'hsl(var(--muted-foreground))', fontWeight: 500, lineHeight: 1.45 }}>This asset is required for the job — it must be <b style={{ color: 'hsl(var(--foreground))' }}>Verified</b> before the job can be submitted.</span></div>}
    <MBtn variant={btnVariant} icon={canSave ? 'check' : 'circle-alert'} full onClick={() => onSave({ installed, serial: serial.trim(), mac: mac.trim(), condition, notes: notes.trim(), photo, qr, verdict })}>{btnLabel}</MBtn>
  </Sheet>;
}

Object.assign(window, { Sheet, MCheckGroup, MPhotoGrid, BlockedSheet, CompleteBlockedSheet, PrestartGateSheet, BreakReasonSheet, AdjustSheet, SignSheet, AddMaterialSheet, AssetSheet });
