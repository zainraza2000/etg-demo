// ETG Dashboard — root app: shell + screen routing.
const { useState: useStateApp } = React;

function Placeholder({ id }) {
  const item = NAV.find((n) => n.id === id);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 60, color: 'hsl(var(--muted-foreground))' }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon name={item?.icon || 'box'} size={30} color="hsl(var(--muted-foreground))" />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'hsl(var(--foreground))', margin: '0 0 6px' }}>{item?.label}</h1>
      <p style={{ fontSize: 14, maxWidth: 380, margin: 0 }}>This module isn't part of the v1 UI-kit recreation. Explore <b style={{ color: 'hsl(var(--primary))' }}>Projects</b>, <b style={{ color: 'hsl(var(--primary))' }}>Service Tickets</b>, <b style={{ color: 'hsl(var(--primary))' }}>Assets</b> and the <b style={{ color: 'hsl(var(--primary))' }}>Calendar</b> for fully-built screens.</p>
    </div>
  );
}

function App() {
  const [active, setActive] = useStateApp('projects');
  const [subpage, setSubpage] = useStateApp(null); // e.g. 'new-ticket', 'new-project'

  function navigate(id) { setSubpage(null); setActive(id); }

  function renderContent() {
    if (subpage === 'new-ticket') return <CreateTicketScreen onClose={() => setSubpage(null)} />;
    if (subpage === 'new-project') return <CreateProjectScreen onClose={() => setSubpage(null)} />;
    switch (active) {
      case 'projects': return <ProjectsScreen onNewProject={() => setSubpage('new-project')} />;
      case 'tickets': return <ServiceTicketsScreen onNewTicket={() => setSubpage('new-ticket')} />;
      case 'assets': return <AssetsScreen />;
      case 'calendar': return <CalendarScreen />;
      case 'timesheets': return <TimesheetsScreen />;
      case 'reconciliation': return <ReconciliationScreen />;
      case 'invoice-matching': return <InvoiceMatchingScreen />;
      default: return <Placeholder id={active} />;
    }
  }

  const railActive = subpage === 'new-ticket' ? 'tickets' : subpage === 'new-project' ? 'projects' : active;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'hsl(var(--sidebar))', overflow: 'hidden' }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar active={railActive} onNavigate={navigate} />
        <main style={{ flex: 1, minWidth: 0, background: 'hsl(var(--background))', borderTopLeftRadius: 22, overflow: 'auto' }}>
          <div style={{ padding: '26px 28px 40px' }}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
