// ETG Dashboard — app shell: collapsible Sidebar (nav rail) + TopBar.
const { useState: useStateShell } = React;

// Invoices splits into two ledgers — Customer (AR) and Supplier (AP).
const INVOICE_SUB = {
  Customer: [
    { label: 'Unpaid Invoices', icon: 'receipt' },
    { label: 'Paid Invoices', icon: 'check-circle-2' },
    { label: 'Payments', icon: 'banknote' },
    { label: 'Credits', icon: 'file-minus', up: true },
    { label: 'Retentions', icon: 'piggy-bank', up: true },
  ],
  Supplier: [
    { label: 'Supplier Invoices', icon: 'file-text' },
    { label: 'Contractor Unpaid Invoices', icon: 'file-clock', up: true },
    { label: 'Contractor Paid Invoices', icon: 'check-circle-2', up: true },
    { label: 'Contractor Retentions', icon: 'lock', up: true },
    { label: 'Contractor Variances', icon: 'git-compare-arrows', up: true },
  ],
};

function Sidebar({ active, onNavigate, collapsed, onToggle }) {
  const [hover, setHover] = useStateShell(null);
  const [hoverRect, setHoverRect] = useStateShell(null);
  const [openParent, setOpenParent] = useStateShell(null);
  const W = collapsed ? 68 : 248;

  function enter(e, id) { setHover(id); setHoverRect(e.currentTarget.getBoundingClientRect()); }
  function leave() { setHover(null); }

  return (
    <aside onMouseLeave={leave} style={{ width: W, flexShrink: 0, background: 'hsl(var(--sidebar))', color: 'hsl(var(--sidebar-foreground))',
      display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', transition: 'width .16s ease' }}>
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '12px 10px' : '14px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const on = item.id === active;
          const isInvoices = item.id === 'invoices';
          const parentOpen = openParent === item.id;

          // ---- collapsed: icon-only button ----
          if (collapsed) {
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} onMouseEnter={(e) => enter(e, item.id)}
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 44,
                  border: 'none', cursor: 'pointer', borderRadius: 9, background: on ? 'hsl(var(--primary))' : (hover === item.id ? 'hsl(215 30% 18%)' : 'transparent') }}>
                <Icon name={item.icon} size={19} color={on ? '#fff' : 'hsl(var(--sidebar-foreground))'} />
                {item.badge && <span style={{ position: 'absolute', top: 6, right: 12, width: 8, height: 8, borderRadius: '50%', background: 'hsl(var(--destructive))', border: '1.5px solid hsl(var(--sidebar))' }} />}
              </button>
            );
          }

          // ---- expanded: Invoices accordion parent ----
          if (isInvoices) {
            return (
              <div key={item.id}>
                <button onClick={() => setOpenParent(parentOpen ? null : item.id)} onMouseEnter={() => setHover(item.id)} onMouseLeave={() => setHover(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: 500, padding: '10px 12px', borderRadius: 9,
                    background: hover === item.id ? 'hsl(215 30% 18%)' : 'transparent', color: 'hsl(var(--sidebar-foreground))' }}>
                  <Icon name={item.icon} size={18} color="hsl(var(--sidebar-foreground))" />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <Icon name={parentOpen ? 'chevron-down' : 'chevron-right'} size={15} color="hsl(215 20% 55%)" />
                </button>
                {parentOpen && <div style={{ padding: '4px 0 6px' }}>
                  {Object.keys(INVOICE_SUB).map((group) => (
                    <div key={group} style={{ marginBottom: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'hsl(215 20% 50%)', padding: '5px 12px 3px 40px' }}>{group}</div>
                      {INVOICE_SUB[group].map((s) => (
                        <button key={s.label} onClick={() => onNavigate('invoices')} style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                          border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, color: 'hsl(215 20% 72%)', padding: '6px 12px 6px 40px', borderRadius: 8 }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(215 30% 18%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                          <Icon name={s.icon} size={14} color="hsl(215 20% 60%)" />
                          <span style={{ flex: 1 }}>{s.label}</span>
                          {s.up && <Icon name="sparkles" size={11} color="hsl(258 70% 70%)" />}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>}
              </div>
            );
          }

          // ---- expanded: flat item ----
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} onMouseEnter={() => setHover(item.id)} onMouseLeave={() => setHover(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500, padding: '10px 12px', borderRadius: 9,
                background: on ? 'hsl(var(--primary))' : (hover === item.id ? 'hsl(215 30% 18%)' : 'transparent'), color: on ? '#fff' : 'hsl(var(--sidebar-foreground))' }}>
              <Icon name={item.icon} size={18} color={on ? '#fff' : 'hsl(var(--sidebar-foreground))'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: 'hsl(var(--destructive))', color: '#fff', fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Health score — full card (expanded) or compact chip (collapsed) */}
      <div style={{ padding: collapsed ? '0 10px 8px' : 14 }}>
        {collapsed
          ? <div onMouseEnter={(e) => enter(e, '__health')} style={{ width: 48, height: 48, margin: '0 auto', borderRadius: '50%', background: 'hsl(215 35% 15%)', border: '2px solid hsl(var(--success))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: 'hsl(var(--success))', lineHeight: 1 }}>78</span></div>
          : <div style={{ background: 'hsl(215 35% 15%)', border: '1px solid hsl(var(--sidebar-border))', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(215 20% 65%)' }}>Company Health Score</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, margin: '8px 0 10px' }}>
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: 'hsl(var(--success))' }}>78</span><span style={{ fontSize: 13, color: 'hsl(215 20% 65%)' }}>/100</span></div>
              <div style={{ height: 7, background: 'hsl(215 30% 24%)', borderRadius: 999, overflow: 'hidden' }}><div style={{ height: '100%', width: '78%', background: 'hsl(var(--success))', borderRadius: 999 }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ color: 'hsl(var(--success))', fontWeight: 700, fontSize: 13 }}>Good</span><span style={{ color: 'hsl(211 70% 65%)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>View Details ›</span></div>
            </div>}
      </div>

      {/* collapse / expand toggle */}
      <div style={{ padding: collapsed ? '0 10px 12px' : '0 14px 14px', borderTop: '1px solid hsl(var(--sidebar-border))', paddingTop: 12 }}>
        <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10, width: '100%',
          border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: 'hsl(215 20% 65%)', padding: '8px 10px', borderRadius: 8 }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(215 30% 18%)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={18} color="hsl(215 20% 65%)" />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* collapsed flyouts / tooltips (fixed so they escape the rail) */}
      {collapsed && hover && hoverRect && (() => {
        const top = hoverRect.top; const left = hoverRect.right + 10;
        if (hover === 'invoices') {
          return <div style={{ position: 'fixed', top: Math.max(8, top - 40), left, zIndex: 1000, background: 'hsl(215 42% 22%)', border: '1px solid hsl(var(--sidebar-border))', borderRadius: 12, boxShadow: 'var(--shadow-xl)', padding: '14px 16px', width: 380 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><Icon name="receipt" size={16} color="#fff" /><span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Invoices</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {Object.keys(INVOICE_SUB).map((group) => <div key={group}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(215 20% 60%)', marginBottom: 8 }}>{group}</div>
                {INVOICE_SUB[group].map((s) => <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13, color: 'hsl(215 25% 85%)', cursor: 'pointer' }}>
                  <Icon name={s.icon} size={14} color="hsl(215 20% 65%)" /><span style={{ flex: 1 }}>{s.label}</span>{s.up && <Icon name="sparkles" size={11} color="hsl(258 70% 72%)" />}</div>)}
              </div>)}
            </div>
          </div>;
        }
        const item = NAV.find((n) => n.id === hover);
        const label = hover === '__health' ? 'Company Health · 78/100 · Good' : (item && item.label);
        if (!label) return null;
        return <div style={{ position: 'fixed', top: top + 10, left, zIndex: 1000, background: 'hsl(215 42% 22%)', color: '#fff', border: '1px solid hsl(var(--sidebar-border))', borderRadius: 8, padding: '6px 11px', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', boxShadow: 'var(--shadow-lg)' }}>{label}</div>;
      })()}
    </aside>
  );
}

function TopBar({ collapsed }) {
  return (
    <header style={{ height: 68, flexShrink: 0, background: 'hsl(var(--sidebar))', display: 'flex', alignItems: 'center', paddingRight: 22 }}>
      <div style={{ width: collapsed ? 68 : 248, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '0' : '0 18px', justifyContent: collapsed ? 'center' : 'flex-start', transition: 'width .16s ease' }}>
        <img src="assets/etg-mark.svg" alt="ETG" style={{ height: 34 }} />
        {!collapsed && <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: 26, letterSpacing: '-0.02em', color: '#fff' }}>ETG</span>}
      </div>
      <div style={{ position: 'relative', width: 360 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'hsl(215 20% 60%)' }}><Icon name="search" size={16} /></span>
        <input placeholder="Search ETG..." style={{ width: '100%', height: 40, paddingLeft: 38, paddingRight: 12, boxSizing: 'border-box',
          background: 'hsl(215 35% 17%)', border: '1px solid hsl(var(--sidebar-border))', borderRadius: 9, color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Icon name="help-circle" size={20} color="hsl(215 20% 70%)" />
        <div style={{ position: 'relative' }}>
          <Icon name="bell" size={20} color="hsl(215 20% 70%)" />
          <span style={{ position: 'absolute', top: -6, right: -7, background: 'hsl(var(--destructive))', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 17, height: 17, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>12</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
          <Avatar name="John Manager" size={38} />
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>John Manager</div>
            <div style={{ color: 'hsl(215 20% 60%)', fontSize: 12 }}>Manager</div>
          </div>
          <Icon name="chevron-down" size={16} color="hsl(215 20% 60%)" />
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar });
