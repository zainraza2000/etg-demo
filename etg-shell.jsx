// ETG Dashboard — app shell: Sidebar (nav rail) + TopBar.
const { useState: useStateShell } = React;

function Sidebar({ active, onNavigate }) {
  const [hover, setHover] = useStateShell(null);
  return (
    <aside style={{ width: 248, flexShrink: 0, background: 'hsl(var(--sidebar))', color: 'hsl(var(--sidebar-foreground))',
      display: 'flex', flexDirection: 'column', height: '100%' }}>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const on = item.id === active;
          const bg = on ? 'hsl(var(--primary))' : (hover === item.id ? 'hsl(215 30% 18%)' : 'transparent');
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              onMouseEnter={() => setHover(item.id)} onMouseLeave={() => setHover(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                padding: '10px 12px', borderRadius: 9,
                background: bg,
                color: on ? '#fff' : 'hsl(var(--sidebar-foreground))' }}>
              <Icon name={item.icon} size={18} color={on ? '#fff' : 'hsl(var(--sidebar-foreground))'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: 'hsl(var(--destructive))', color: '#fff', fontSize: 11, fontWeight: 700,
                minWidth: 18, height: 18, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: 14 }}>
        <div style={{ background: 'hsl(215 35% 15%)', border: '1px solid hsl(var(--sidebar-border))', borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(215 20% 65%)' }}>Company Health Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, margin: '8px 0 10px' }}>
            <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: 'hsl(var(--success))' }}>78</span>
            <span style={{ fontSize: 13, color: 'hsl(215 20% 65%)' }}>/100</span>
          </div>
          <div style={{ height: 7, background: 'hsl(215 30% 24%)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '78%', background: 'hsl(var(--success))', borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ color: 'hsl(var(--success))', fontWeight: 700, fontSize: 13 }}>Good</span>
            <span style={{ color: 'hsl(211 70% 65%)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}>View Details ›</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header style={{ height: 68, flexShrink: 0, background: 'hsl(var(--sidebar))', display: 'flex', alignItems: 'center', paddingRight: 22 }}>
      {/* logo lockup occupies the rail-width region */}
      <div style={{ width: 248, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
        <img src="assets/etg-mark.svg" alt="ETG" style={{ height: 34 }} />
        <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: 26, letterSpacing: '-0.02em', color: '#fff' }}>ETG</span>
      </div>
      {/* search */}
      <div style={{ position: 'relative', width: 360 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'hsl(215 20% 60%)' }}><Icon name="search" size={16} /></span>
        <input placeholder="Search ETG..." style={{ width: '100%', height: 40, paddingLeft: 38, paddingRight: 12, boxSizing: 'border-box',
          background: 'hsl(215 35% 17%)', border: '1px solid hsl(var(--sidebar-border))', borderRadius: 9, color: '#fff', fontSize: 14, fontFamily: 'inherit' }} />
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
        <Icon name="help-circle" size={20} color="hsl(215 20% 70%)" />
        <div style={{ position: 'relative' }}>
          <Icon name="bell" size={20} color="hsl(215 20% 70%)" />
          <span style={{ position: 'absolute', top: -6, right: -7, background: 'hsl(var(--destructive))', color: '#fff', fontSize: 10, fontWeight: 700,
            minWidth: 17, height: 17, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>12</span>
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
