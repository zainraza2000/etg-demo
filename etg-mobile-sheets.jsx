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

// ---- checklist group (typed, required markers) -----------------------------
function MCheckGroup({ group, checks, onToggle }) {
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
      {group.items.map((it, i) => { const on = !!checks[i];
        return <button key={i} className="m-press" onClick={() => onToggle(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', minHeight: 50, padding: '8px 13px', borderRadius: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          border: `1px solid ${on ? 'hsl(var(--success) / 0.4)' : 'hsl(var(--border))'}`, background: on ? 'hsl(var(--success) / 0.07)' : 'hsl(var(--card))' }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'hsl(var(--success))' : 'transparent', border: on ? 'none' : '2px solid hsl(var(--border))' }}>{on && <Icon name="check" size={16} color="#fff" />}</span>
          <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>{it.label}</span>
          {it.req && !on && <span style={{ fontSize: 10, fontWeight: 700, color: 'hsl(var(--destructive))', background: 'hsl(var(--destructive) / 0.1)', padding: '2px 7px', borderRadius: 999, flexShrink: 0 }}>Required</span>}
        </button>; })}
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

// ---- add material (note + receipt photo) -----------------------------------
function AddMaterialSheet({ open, onClose, onAdd }) {
  const [name, setName] = useStateS(''); const [qty, setQty] = useStateS(''); const [unit, setUnit] = useStateS('each');
  const [note, setNote] = useStateS(''); const [receipt, setReceipt] = useStateS(false);
  useEffectS(() => { if (open) { setName(''); setQty(''); setUnit('each'); setNote(''); setReceipt(false); } }, [open]);
  const valid = name.trim() && qty;
  return <Sheet open={open} onClose={onClose} title="Add material used" sub="Captured against this job — later feeds supplier-invoice matching.">
    <div style={{ marginBottom: 14 }}><MLabel req>Material</MLabel><MInput autoFocus value={name} onChange={setName} placeholder="e.g. Patch lead" /></div>
    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
      <div style={{ flex: 1 }}><MLabel req>Quantity</MLabel><MInput value={qty} onChange={setQty} placeholder="0" inputMode="decimal" /></div>
      <div style={{ flex: 1 }}><MLabel>Unit</MLabel><MSelect value={unit} onChange={setUnit} options={M_UNITS} /></div>
    </div>
    <div style={{ marginBottom: 14 }}><MLabel>Note <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></MLabel>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. used from van stock" style={{ ...M_INPUT, minHeight: 64, padding: 12, resize: 'none' }} /></div>
    <div style={{ marginBottom: 18 }}><MToggle on={receipt} onChange={setReceipt} label="Receipt / packaging photo" sub={receipt ? 'Photo attached' : 'Optional — tap to attach'} /></div>
    <MBtn variant="primary" icon="check" full disabled={!valid} onClick={() => onAdd({ name: name.trim(), qty: parseFloat(qty), unit, note: note.trim(), receipt })}>Add material</MBtn>
  </Sheet>;
}

// ---- asset update (gap 1) --------------------------------------------------
function AssetSheet({ open, onClose, asset, data, onSave, onFlash }) {
  const [installed, setInstalled] = useStateS(false);
  const [serial, setSerial] = useStateS(''); const [mac, setMac] = useStateS('');
  const [condition, setCondition] = useStateS('Good'); const [notes, setNotes] = useStateS('');
  const [photo, setPhoto] = useStateS(false);
  useEffectS(() => { if (open && data) { setInstalled(!!data.installed); setSerial(data.serial || ''); setMac(data.mac || ''); setCondition(data.condition || 'Good'); setNotes(data.notes || ''); setPhoto(!!data.photo); } }, [open, asset && asset[0]]);
  if (!asset) return null;
  return <Sheet open={open} onClose={onClose} title={asset[1]} sub={`${asset[0]} · ${asset[2] || 'Linked asset'}`}>
    <div style={{ marginBottom: 14 }}><MToggle on={installed} onChange={setInstalled} label="Confirm installed" sub={installed ? 'Marked as installed on site' : 'Tap once fitted and powered'} /></div>
    <div style={{ marginBottom: 14 }}><MLabel>Serial number</MLabel><MInput value={serial} onChange={setSerial} placeholder="e.g. DS-2CD-7732NXI" mono /></div>
    <div style={{ marginBottom: 14 }}><MLabel>MAC address</MLabel><MInput value={mac} onChange={setMac} placeholder="e.g. 44:19:B6:7A:2C:01" mono /></div>
    <div style={{ marginBottom: 14 }}><MLabel>Condition</MLabel><MChips value={condition} options={M_CONDITIONS} onChange={setCondition} /></div>
    <div style={{ marginBottom: 14 }}><MLabel>Service notes</MLabel>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the office should know…" style={{ ...M_INPUT, minHeight: 70, padding: 12, resize: 'none' }} /></div>
    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
      <MBtn variant={photo ? 'subtle' : 'outline'} full icon={photo ? 'check' : 'camera'} onClick={() => { setPhoto(true); onFlash && onFlash('Asset photo captured'); }}>{photo ? 'Photo added' : 'Asset photo'}</MBtn>
      <MBtn variant="outline" full icon="qr-code" onClick={() => onFlash && onFlash('QR scanned — ' + asset[0])}>Scan QR</MBtn>
    </div>
    <MBtn variant="primary" icon="check" full onClick={() => onSave({ installed, serial: serial.trim(), mac: mac.trim(), condition, notes: notes.trim(), photo })}>Save asset details</MBtn>
  </Sheet>;
}

Object.assign(window, { Sheet, MCheckGroup, MPhotoGrid, BlockedSheet, CompleteBlockedSheet, SignSheet, AddMaterialSheet, AssetSheet });
