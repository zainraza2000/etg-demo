// ETG Dashboard — mock data for the UI kit. Mirrors the v1 mockups.
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-days' },
  { id: 'projects', label: 'Projects', icon: 'folder-kanban' },
  { id: 'quotes', label: 'Quotes', icon: 'file-text' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase' },
  { id: 'tickets', label: 'Service Tickets', icon: 'wrench' },
  { id: 'assets', label: 'Assets', icon: 'package' },
  { id: 'crm', label: 'CRM', icon: 'users' },
  { id: 'suppliers', label: 'Suppliers', icon: 'truck' },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: 'shopping-cart' },
  { id: 'invoice-matching', label: 'Invoice Matching', icon: 'arrow-left-right' },
  { id: 'reconciliation', label: 'Reconciliation', icon: 'scale' },
  { id: 'invoices', label: 'Invoices', icon: 'receipt' },
  { id: 'reports', label: 'Reports', icon: 'bar-chart-3' },
  { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 8 },
  { id: 'timesheets', label: 'Timesheets', icon: 'clock' },
  { id: 'approvals', label: 'Approvals', icon: 'check-circle-2' },
  { id: 'documents', label: 'Documents', icon: 'folder' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

// ---- Projects ----
const PROJECT_KPIS = [
  { title: 'Active Projects', value: '28', sub: 'View all', icon: 'folder', color: 'blue' },
  { title: 'Total Contract Value', value: '$4,280,950', sub: 'View report', icon: 'dollar-sign', color: 'green' },
  { title: 'Total Actual Cost', value: '$2,897,450', sub: 'View report', icon: 'bar-chart-3', color: 'orange' },
  { title: 'Overall Margin', value: '32.3%', sub: 'View report', icon: 'pie-chart', color: 'violet' },
  { title: 'Margin Risk Projects', value: '3', sub: 'View list', icon: 'alert-triangle', color: 'red' },
  { title: 'Invoice Ready', value: '12', sub: 'View list', icon: 'check-circle-2', color: 'slate' },
];

const PROJECTS = [
  { id: 'PRJ-000142', name: 'Sydney Office Upgrade', client: 'ABC Corporate', loc: 'Sydney, NSW', status: 'In Progress', serviceType: 'CCTV & Electrical', value: '$420,000', margin: 28.4, health: 78, end: '15 Aug 2026', pm: 'John Manager', start: '12 May 2026',
    costCentres: [
      { id: 'CC-000045', name: 'Electrical', budget: '$110,000', actual: '$128,000', margin: -16.4, risk: 'CRITICAL', progress: 100, status: 'Invoiced' },
      { id: 'CC-000046', name: 'CCTV', budget: '$90,000', actual: '$82,000', margin: 8.9, risk: 'HIGH', progress: 80, status: 'In Progress' },
      { id: 'CC-000047', name: 'Automation', budget: '$220,000', actual: '$248,000', margin: -12.7, risk: 'CRITICAL', progress: 40, status: 'In Progress' },
      { id: 'CC-000048', name: 'Maintenance', budget: '$20,000', actual: '$0', margin: 0, risk: 'LOW', progress: 0, status: 'Planned' },
      { id: 'CC-000049', name: 'Network / Data', budget: '$60,000', actual: '$41,000', margin: 18.2, risk: 'LOW', progress: 55, status: 'In Progress' },
    ] },
  { id: 'PRJ-000143', name: 'Warehouse Fitout', client: 'Kingston Logistics', loc: 'Melbourne, VIC', status: 'In Progress', serviceType: 'Electrical & Data', value: '$320,000', margin: 22.1, health: 72, end: '30 Sep 2026', pm: 'John Manager', start: '02 Apr 2026',
    costCentres: [
      { id: 'CC-000051', name: 'Electrical Fitout', budget: '$240,000', actual: '$201,000', margin: 16.3, risk: 'LOW', progress: 70, status: 'In Progress' },
    ] },
  { id: 'PRJ-000144', name: 'School Security Upgrade', client: "St. Mary's College", loc: 'Brisbane, QLD', status: 'In Progress', serviceType: 'Access Control', value: '$185,500', margin: 4.1, health: 48, end: '10 Jul 2026', pm: 'Sarah Chen', start: '01 Mar 2026', overdue: true,
    costCentres: [
      { id: 'CC-000061', name: 'Access Control', budget: '$120,000', actual: '$132,500', margin: -10.4, risk: 'CRITICAL', progress: 90, status: 'In Progress' },
      { id: 'CC-000062', name: 'CCTV', budget: '$45,000', actual: '$40,000', margin: 11.1, risk: 'HIGH', progress: 75, status: 'In Progress' },
      { id: 'CC-000063', name: 'Cabling', budget: '$20,500', actual: '$18,200', margin: 11.2, risk: 'LOW', progress: 100, status: 'Invoiced' },
    ] },
  { id: 'PRJ-000145', name: 'Shopping Centre CCTV', client: 'Retail Group', loc: 'Perth, WA', status: 'On Hold', serviceType: 'CCTV', value: '$265,000', margin: 24.8, health: 68, end: '—', pm: 'Priya Nair', start: '18 Feb 2026', costCentres: [] },
  { id: 'PRJ-000146', name: 'Manufacturing Automation', client: 'Fusion Manufacturing', loc: 'Adelaide, SA', status: 'In Progress', serviceType: 'Automation & Comms', value: '$550,000', margin: 31.6, health: 81, end: '20 Oct 2026', pm: 'Sarah Chen', start: '10 Jan 2026', costCentres: [] },
  { id: 'PRJ-000147', name: 'Retail Store Rollout', client: 'Fashion Retailers', loc: 'Sydney, NSW', status: 'Quoted', serviceType: 'CCTV & Network', value: '$145,000', margin: 25.3, health: 66, end: '15 Nov 2026', pm: 'Priya Nair', start: '01 Jul 2026', costCentres: [] },
  { id: 'PRJ-000148', name: 'ABC Loading Dock CCTV', client: 'ABC Corporate', loc: 'Sydney, NSW', status: 'In Progress', serviceType: 'CCTV', value: '$96,000', margin: 7.8, health: 54, end: '28 Jun 2026', pm: 'John Manager', start: '06 May 2026',
    costCentres: [
      { id: 'CC-000071', name: 'CCTV', budget: '$70,000', actual: '$66,400', margin: 5.1, risk: 'HIGH', progress: 60, status: 'In Progress' },
      { id: 'CC-000072', name: 'Make Good', budget: '$12,000', actual: '$13,900', margin: -15.8, risk: 'CRITICAL', progress: 100, status: 'Invoiced' },
    ] },
  { id: 'PRJ-000140', name: 'Head Office Comms Refresh', client: 'Kingston Logistics', loc: 'Melbourne, VIC', status: 'Completed', serviceType: 'Comms & Data', value: '$210,000', margin: 27.5, health: 88, end: '20 Apr 2026', pm: 'Sarah Chen', start: '05 Jan 2026', costCentres: [] },
];

// ---- Service Tickets ----
const TICKET_KPIS = [
  { title: 'Active Tickets', value: '23', sub: 'View all', icon: 'shield-alert', color: 'blue' },
  { title: 'In Progress', value: '12', sub: 'View all', icon: 'clock', color: 'orange' },
  { title: 'On Hold', value: '5', sub: 'View all', icon: 'pause-circle', color: 'green' },
  { title: 'Overdue', value: '4', sub: 'View all', icon: 'alarm-clock', color: 'red' },
  { title: 'Resolved (30 Days)', value: '38', sub: 'View all', icon: 'check-circle-2', color: 'violet', upcoming: true },
  { title: 'Avg. Resolution Time', value: '18.6 hrs', sub: 'View report', icon: 'timer', color: 'slate', upcoming: true },
];

const TICKETS = [
  { id: 'ST-000105', subject: 'CCTV Cameras Offline', note: '3 assets affected', client: 'ABC Corporate', site: 'Sydney Office', asset: 'HIK-DS-2CD2387G2-LU', assetLoc: 'Reception', priority: 'High', status: 'In Progress', assignee: 'Brendan Lee', created: '15 May 2026', createdT: '8:32 AM', due: '15 May 2026', dueT: '12:00 PM', overdue: true,
    location: 'Reception', assetCount: '3 Cameras', createdBy: 'John Smith (Client)', impact: 'High', impactNote: 'Site security monitoring is not functioning.',
    desc: 'All cameras in reception area are offline. Unable to view live or recorded footage.', internal: 'Intermittent network issue reported by client. Check switch SW-CORE-01 and PoE status.', job: 'FJ-001052 – CCTV Maintenance' },
  { id: 'ST-000104', subject: 'Access Control Not Unlocking Door', client: 'ABC Corporate', site: 'Sydney Office', asset: 'ACC-MAIN-01', assetLoc: 'Server Room', priority: 'High', status: 'Open', assignee: 'Jake Murray', created: '15 May 2026', createdT: '7:45 AM', due: '15 May 2026', dueT: '4:00 PM', overdue: true },
  { id: 'ST-000103', subject: 'NVR Recording Issue', client: 'Retail Group', site: 'Store 47', asset: 'NVR-DS-7732NXI-K4', assetLoc: 'Comms Room', priority: 'Medium', status: 'In Progress', assignee: 'Liam Smith', created: '14 May 2026', createdT: '4:22 PM', due: '16 May 2026', dueT: '9:00 AM' },
  { id: 'ST-000102', subject: 'Intermittent Network Dropouts', client: 'Fusion Manufacturing', site: 'Factory 1', asset: 'SW-CORE-01', assetLoc: 'Main Switch', priority: 'Medium', status: 'Open', assignee: 'Michael Davis', created: '14 May 2026', createdT: '11:18 AM', due: '16 May 2026', dueT: '5:00 PM' },
  { id: 'ST-000101', subject: 'Motion Detection Not Triggering', client: "St. Mary's College", site: 'Main Campus', asset: 'CAM-BULLET-12', assetLoc: 'Building A', priority: 'Low', status: 'On Hold', assignee: 'Unassigned', created: '14 May 2026', createdT: '9:05 AM', due: '19 May 2026', dueT: '—' },
  { id: 'ST-000100', subject: 'IP Intercom No Audio', client: 'ABC Corporate', site: 'Sydney Office', asset: 'IP-INTERCOM-01', assetLoc: 'Main Entrance', priority: 'Low', status: 'In Progress', assignee: 'Anthony White', created: '13 May 2026', createdT: '3:32 PM', due: '15 May 2026', dueT: '3:00 PM' },
  { id: 'ST-000099', subject: 'CCTV Image Quality Poor', client: 'TechVision Wholesale', site: 'Warehouse', asset: 'CAM-DOME-04', assetLoc: 'Warehouse', priority: 'Low', status: 'Open', assignee: 'Brendan Lee', created: '13 May 2026', createdT: '10:14 AM', due: '18 May 2026', dueT: '2:00 PM' },
  { id: 'ST-000098', subject: 'Door Reader Offline', client: 'Retail Group', site: 'Store 50', asset: 'DOOR-CTRL-02', assetLoc: 'Back Door', priority: 'Medium', status: 'Open', assignee: 'Jake Murray', created: '12 May 2026', createdT: '2:09 PM', due: '15 May 2026', dueT: '5:00 PM' },
];
TICKETS.forEach((t, i) => {
  if (!t.source) t.source = ['Phone', 'Email', 'Manager Entry', 'Technician Field Report', 'Email', 'Phone', 'Manager Entry', 'Email'][i] || 'Phone';
  if (t.assets == null) t.assets = (t.id === 'ST-000105') ? 3 : 1;
});
// enrich tickets: issue type, ownership, subject type, conversions, impact, timeline
const _TK = {
  'ST-000105': { issueType: 'CCTV / Video', subjectType: 'Customer', bu: 'Evolution', ownership: 'ETG Owned', impact: 'Site disrupted', fj: 'FJ-001052', prj: 'PRJ-000142', cc: 'CC-000046',
    timeline: [['Ticket created', '15 May 2026, 8:32 AM', 'plus'], ['Auto-flagged High (asset offline)', '15 May 2026, 8:32 AM', 'zap'], ['Assigned to Brendan Lee', '15 May 2026, 9:01 AM', 'user'], ['Customer notified of ETA', '15 May 2026, 9:05 AM', 'mail', true]] },
  'ST-000104': { issueType: 'Access Control', subjectType: 'Customer', bu: 'Evolution', ownership: 'ETG Owned', impact: 'Safety risk', fj: 'FJ-001053' },
  'ST-000103': { issueType: 'CCTV / Video', subjectType: 'Customer', bu: 'Evolution', ownership: 'ETG Owned', impact: 'Minor' },
  'ST-000102': { issueType: 'Network / Connectivity', subjectType: 'Customer', bu: 'Evolution', ownership: 'ETG Owned', impact: 'Site disrupted', prj: 'PRJ-000146' },
  'ST-000101': { issueType: 'CCTV / Video', subjectType: 'Customer', bu: 'Evolution', ownership: 'ETG Owned', impact: 'No impact' },
  'ST-000100': { issueType: 'Intercom', subjectType: 'Customer', bu: 'Localcom', ownership: 'Localcom Owned', impact: 'Minor' },
};
TICKETS.forEach((t) => Object.assign(t, _TK[t.id] || { issueType: 'Other', subjectType: 'Customer', bu: 'Evolution', ownership: 'ETG Owned', impact: 'Minor' }));
// extra non-customer rows demonstrating the routing variety
TICKETS.push(
  { id: 'ST-000097', subject: 'Office Internet Down', note: 'Whole site offline', client: 'Localcom (Internal)', site: 'Head Office', asset: '—', assetLoc: '—', priority: 'High', status: 'In Progress', assignee: 'Liam Smith', created: '13 May 2026', createdT: '8:05 AM', due: '13 May 2026', dueT: '11:00 AM', overdue: true, source: 'Phone', assets: 0, issueType: 'Internet / NBN', subjectType: 'Localcom', bu: 'Localcom', ownership: 'Localcom Owned', impact: 'Site disrupted' },
  { id: 'ST-000096', subject: 'Missing Supplier Invoice — Hikvision', client: 'TechVision Wholesale', site: '—', asset: '—', assetLoc: '—', priority: 'Medium', status: 'Open', assignee: 'Sarah Chen', created: '12 May 2026', createdT: '1:40 PM', due: '16 May 2026', dueT: '—', source: 'Manager Entry', assets: 0, issueType: 'Supplier / Procurement', subjectType: 'Supplier', bu: 'Evolution', ownership: 'ETG Owned', impact: 'No impact' },
  { id: 'ST-000095', subject: 'Vehicle Service — Van 3', client: 'ETG (Internal)', site: 'Depot', asset: '—', assetLoc: '—', priority: 'Low', status: 'Open', assignee: 'Unassigned', created: '12 May 2026', createdT: '9:20 AM', due: '20 May 2026', dueT: '—', source: 'Manager Entry', assets: 0, issueType: 'Internal / Fleet', subjectType: 'Internal', bu: 'Evolution', ownership: 'Internal', impact: 'No impact' },
  { id: 'ST-000094', subject: 'Shared Site — Who Owns This?', note: 'ETG + Localcom services', client: 'ABC Corporate', site: 'Sydney Office', asset: '—', assetLoc: 'Comms Room', priority: 'Medium', status: 'Open', assignee: 'Unassigned', created: '11 May 2026', createdT: '4:50 PM', due: '15 May 2026', dueT: '—', source: 'Email', assets: 2, issueType: 'Network / Connectivity', subjectType: 'Customer', bu: 'Shared', ownership: 'Needs Review', impact: 'Minor' },
);
const TICKETS_NEEDS_REVIEW = TICKETS.filter((t) => t.ownership === 'Needs Review').length;

// ---- option literals (forms) ----
const ISSUE_TYPES = ['CCTV / Video', 'Access Control', 'Network / Connectivity', 'Intercom', 'Internet / NBN', 'Alarm / Intrusion', 'Supplier / Procurement', 'Internal / Fleet', 'Other'];
const SOURCES = ['Phone', 'Email', 'Manager Entry', 'Customer Portal', 'Technician Field Report', 'Asset Alert'];
const CUSTOMER_IMPACT = ['No impact', 'Minor', 'Site disrupted', 'Safety risk'];
const JOB_CLASSIFICATIONS = ['Service Call', 'Warranty', 'Maintenance', 'Project Work', 'Callback / Rework', 'Emergency / After-hours'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const SAMPLE_CUSTOMERS = [
  { id: 'CLI-000023', name: 'ABC Corporate', etg: true, localcom: true, sites: 12, services: 18, assets: 245 },
  { id: 'CLI-000041', name: 'Retail Group', etg: true, localcom: false, sites: 8, services: 6, assets: 132 },
  { id: 'CLI-000052', name: 'Localcom (Internal)', etg: false, localcom: true, sites: 2, services: 4, assets: 0 },
];
// project form options
const PROJECT_CLIENTS = SAMPLE_CUSTOMERS;
const PROJECT_OWNERS = [['USR-000012', 'John Manager'], ['USR-000016', 'Sarah Chen'], ['USR-000018', 'Priya Nair']];
const PROJECT_SERVICE_TYPES = ['Mixed', 'CCTV', 'Access Control', 'Electrical', 'Network / Data', 'Automation', 'Comms / NBN'];
const PROJECT_STATUSES = ['Quoted', 'Planned', 'In Progress', 'On Hold', 'Completed'];
const PROJECT_SUPPLIERS = [['SUP-000019', 'TechVision Wholesale'], ['SUP-000022', 'Security Distributors'], ['SUP-000031', 'Bosch Security Systems']];
const PROJECT_SKILLS = ['Security Licence 1A', 'Electrical (A-Grade)', 'Cabling (ACMA)', 'Working at Heights', 'Networking'];
const SAMPLE_QUOTE = { id: 'Q-002184', value: '$96,000.00', accepted: '02 May 2026', client: 'ABC Corporate' };
// existing field jobs a visit can schedule (FJ- · title · client – site, + auto-fill data)
const FIELD_JOBS = [
  { fj: 'FJ-000310', title: 'CCTV Upgrade', client: 'ABC Corporate', site: 'Sydney Office', cc: 'CC-000046', skills: ['CCTV'], licences: ['Security Licence 1A'] },
  { fj: 'FJ-000311', title: 'Access Control Install', client: 'ABC Corporate', site: 'Sydney Office', cc: 'CC-000045', skills: ['Access Control'], licences: ['Security Licence 1A'] },
  { fj: 'FJ-000305', title: 'Automation Install', client: 'Fusion Manufacturing', site: 'Factory 1', cc: 'CC-000049', skills: ['Automation', 'Networking'], licences: ['Electrical (A-Grade)'] },
  { fj: 'FJ-000288', title: 'School Security Upgrade', client: "St. Mary's College", site: 'Main Campus', cc: 'CC-000061', skills: ['Access Control'], licences: ['Security Licence 1A'] },
  { fj: 'FJ-000277', title: 'Store 47 Maintenance', client: 'Retail Group', site: 'Store 47', cc: 'CC-000046', skills: ['CCTV', 'Alarms'], licences: ['Working at Heights'] },
];

// ---- Client Assets ----
const ASSET_KPIS = [
  { title: 'Total Assets', value: '1,248', sub: 'View all', icon: 'box', color: 'blue', preview: true },
  { title: 'Online', value: '1,023', sub: '82% — View details', icon: 'check-circle-2', color: 'green', preview: true },
  { title: 'Offline', value: '112', sub: '9% — View alerts', icon: 'alert-triangle', color: 'orange', preview: true },
  { title: 'Faulty / Issues', value: '34', sub: '3% — View faults', icon: 'wrench', color: 'red', preview: true },
  { title: 'Under Warranty', value: '688', sub: '55% — View report', icon: 'shield-check', color: 'violet', preview: true },
  { title: 'Warranty Expiring', value: '56', sub: 'View report', icon: 'calendar-clock', color: 'slate', upcoming: true },
];

const ASSETS = [
  { tag: 'HIK-DS-2CD2387G2-LU', name: 'Reception Dome Camera', model: 'Camera – Dome 8MP', type: 'CCTV Camera', client: 'ABC Corporate', site: 'Sydney Office', loc: 'Reception', sub: 'Level 1', status: 'Online', criticality: 'High', ip: '192.168.1.101', mac: '00:1A:2B:3C:4D:5E', warranty: '17/09/2026', warrantyDays: '364 days', health: 90,
    serial: 'DS-2CD2387G2-LU12345678', install: '17 Sep 2024', installAgo: '8 months ago', project: 'PRJ-000128', costCentre: 'CC-000046', supplier: 'SUP-000019', po: 'SI-000088', extInv: 'INV-55421', fj: 'FJ-000291', firmware: 'V5.7.3', monitoring: true, lastChecked: '8:55 AM', qr: true,
    alerts: [['Critical', 'Camera offline', '9:12 AM, 15 May 2026'], ['Warning', 'Intermittent connectivity', '4 events in 24h']] },
  { tag: 'NVR-DS-7732NXI-K4', name: 'Main NVR Recorder', model: 'NVR – 32 Channel', type: 'CCTV Recorder', client: 'ABC Corporate', site: 'Sydney Office', loc: 'Comm Room', sub: 'Level 2', status: 'Online', criticality: 'High', ip: '192.168.1.50', mac: '00:1A:2B:3C:4D:60', warranty: '17/09/2026', warrantyDays: '364 days', health: 85,
    serial: 'DS-7732NXI-K4-99001', install: '17 Sep 2024', project: 'PRJ-000128', costCentre: 'CC-000046', supplier: 'SUP-000019', po: 'SI-000088', extInv: 'INV-55421', fj: 'FJ-000291', firmware: 'V4.62.1', monitoring: true, lastChecked: '8:55 AM', qr: true, alerts: [] },
  { tag: 'SW-CORE-01', name: 'Core Network Switch', model: 'Cisco CBS350-48P', type: 'Network Switch', client: 'Fusion Manufacturing', site: 'Factory 1', loc: 'Comms Room', sub: 'Adelaide, SA', status: 'Online', criticality: 'High', ip: '192.168.1.2', mac: '00:1A:2B:3C:4D:61', warranty: '12/04/2027', warrantyDays: '571 days', health: 88,
    serial: 'CBS350-48P-22310', install: '10 Jan 2026', project: 'PRJ-000146', costCentre: 'CC-000049', supplier: 'SUP-000022', po: 'SI-000071', extInv: 'INV-33120', fj: 'FJ-000305', firmware: '3.2.0.84', monitoring: true, lastChecked: '8:40 AM', qr: true, alerts: [['Informational', 'Firmware update available', '2 days ago']] },
  { tag: 'ACC-MAIN-01', name: 'Main Access Controller', model: 'HID VertX V1000', type: 'Access Controller', client: 'ABC Corporate', site: 'Sydney Office', loc: 'Server Room', sub: 'Level 2', status: 'Online', criticality: 'High', ip: '192.168.1.60', mac: '00:1A:2B:3C:4D:62', warranty: '05/02/2026', warrantyDays: '139 days', health: 75,
    serial: 'VERTX-V1000-44120', install: '05 Feb 2024', project: 'PRJ-000128', costCentre: 'CC-000045', supplier: 'SUP-000019', po: '', extInv: '', fj: 'FJ-000291', firmware: '', monitoring: true, lastChecked: '8:41 AM', qr: true, alerts: [['Warning', 'Warranty expiring in 139 days', 'Today']] },
  { tag: 'PANEL-001', name: 'Building Alarm Panel', model: 'Bosch B9512G Alarm Panel', type: 'Intrusion Panel', client: "St. Mary's College", site: 'Main Campus', loc: 'Electrical Room', sub: 'Brisbane, QLD', status: 'Offline', criticality: 'High', ip: '192.168.1.80', mac: '', warranty: 'Expired', warrantyDays: '11/04/2024', health: 35,
    serial: 'B9512G-00781', install: '11 Apr 2021', project: 'PRJ-000144', costCentre: 'CC-000061', supplier: 'SUP-000031', po: '', extInv: '', fj: 'FJ-000288', firmware: '', monitoring: true, lastChecked: '7:02 AM', qr: false,
    alerts: [['Critical', 'Panel offline — no comms', '7:02 AM, 15 May 2026'], ['Critical', 'Warranty expired', '11 Apr 2024']] },
  { tag: 'IP-INTERCOM-01', name: 'Front Entrance Intercom', model: '2N IP Verso', type: 'Intercom', client: 'ABC Corporate', site: 'Sydney Office', loc: 'Main Entrance', sub: 'Ground Floor', status: 'Online', criticality: 'Medium', ip: '192.168.1.120', mac: '00:1A:2B:3C:4D:64', warranty: '22/06/2026', warrantyDays: '277 days', health: 80,
    serial: '2N-VERSO-55012', install: '22 Jun 2024', project: 'PRJ-000128', costCentre: 'CC-000046', supplier: 'SUP-000019', po: 'SI-000088', extInv: 'INV-55421', fj: 'FJ-000291', firmware: '2.36', monitoring: false, lastChecked: '—', qr: true, alerts: [] },
  { tag: 'UPS-001', name: 'Server Room UPS', model: 'APC Smart-UPS 3000VA', type: 'UPS', client: 'Retail Group', site: 'Store 47', loc: 'Comms Room', sub: 'Perth, WA', status: 'Online', criticality: 'Medium', ip: '192.168.1.200', mac: '00:1A:2B:3C:4D:65', warranty: '03/11/2026', warrantyDays: '411 days', health: 92,
    serial: 'SMT3000-77450', install: '03 Nov 2024', project: 'PRJ-000145', costCentre: 'CC-000046', supplier: 'SUP-000022', po: 'SI-000061', extInv: 'INV-20188', fj: 'FJ-000277', firmware: 'UPS 03.1', monitoring: true, lastChecked: '8:30 AM', qr: true, alerts: [['Informational', 'Self-test passed', 'Today 6:00 AM']] },
  { tag: 'DOOR-CTRL-01', name: 'Rear Door Reader', model: 'HID RM40 Reader', type: 'Access Reader', client: 'Retail Group', site: 'Store 47', loc: 'Rear Door', sub: 'Perth, WA', status: 'Online', criticality: 'Low', ip: '192.168.1.130', mac: '00:1A:2B:3C:4D:66', warranty: '22/06/2026', warrantyDays: '277 days', health: 90,
    serial: 'RM40-19022', install: '22 Jun 2024', project: 'PRJ-000145', costCentre: 'CC-000046', supplier: 'SUP-000019', po: 'SI-000061', extInv: 'INV-20188', fj: 'FJ-000277', firmware: '1.4', monitoring: false, lastChecked: '—', qr: false, alerts: [] },
  { tag: 'CAM-BULLET-12', name: 'Car Park Bullet Camera', model: 'HIK-2CD2087G2-LU', type: 'CCTV Camera', client: 'Fusion Manufacturing', site: 'Factory 1', loc: 'Car Park', sub: 'Adelaide, SA', status: 'Offline', criticality: 'Medium', ip: '192.168.1.142', mac: '00:1A:2B:3C:4D:67', warranty: '17/09/2026', warrantyDays: '364 days', health: 40,
    serial: '2CD2087G2-LU-77231', install: '10 Jan 2026', project: 'PRJ-000146', costCentre: 'CC-000049', supplier: 'SUP-000022', po: 'SI-000071', extInv: 'INV-33120', fj: 'FJ-000305', firmware: 'V5.7.3', monitoring: true, lastChecked: '7:15 AM', qr: true,
    alerts: [['Critical', 'Camera offline', '7:15 AM, 15 May 2026']] },
  { tag: 'SW-FLOOR-2-24P', name: 'Level 2 Floor Switch', model: 'Cisco CBS250-24P', type: 'Network Switch', client: 'ABC Corporate', site: 'Sydney Office', loc: 'Comm Room', sub: 'Level 2 - Rack 2', status: 'Online', criticality: 'Medium', ip: '192.168.1.13', mac: '00:1A:2B:3C:4D:68', warranty: '12/04/2027', warrantyDays: '571 days', health: 86,
    serial: 'CBS250-24P-13044', install: '12 Apr 2025', project: 'PRJ-000128', costCentre: 'CC-000049', supplier: 'SUP-000019', po: 'SI-000088', extInv: 'INV-55421', fj: 'FJ-000291', firmware: '3.1.0.57', monitoring: true, lastChecked: '8:55 AM', qr: true, alerts: [] },
];

const ASSET_KPIS2 = [
  { title: 'Due For Service', value: '—', sub: 'maintenance engine', icon: 'wrench', color: 'orange', upcoming: true },
  { title: 'Without QR', value: '—', sub: 'asset tagging', icon: 'qr-code', color: 'violet', upcoming: true },
  { title: 'Missing Supplier Invoice', value: '—', sub: 'warranty proof', icon: 'file-x', color: 'red', upcoming: true },
  { title: 'Missing Required Files', value: '—', sub: 'documentation', icon: 'folder-x', color: 'slate', upcoming: true },
];
// system-assigned asset ids (EG-) + brand derived from model
ASSETS.forEach((a, i) => {
  a.eg = 'EG-' + String(42 + i).padStart(4, '0');
  a.brand = a.model.split(/[ –-]/)[0];
});

// ---- Calendar ----
const CAL_KPIS = [
  { title: 'Jobs Today', value: '18', sub: 'View today', icon: 'briefcase', color: 'blue', readOnly: true },
  { title: 'Technicians Working', value: '14', sub: 'View technicians', icon: 'users', color: 'orange', upcoming: true },
  { title: 'Jobs Completed', value: '6', sub: 'Today', icon: 'check-circle-2', color: 'green', readOnly: true },
  { title: 'Jobs In Progress', value: '9', sub: 'View jobs', icon: 'loader', color: 'blue', readOnly: true },
  { title: 'Overdue Jobs', value: '2', sub: 'View overdue', icon: 'alarm-clock', color: 'red', upcoming: true },
  { title: 'Unassigned Jobs', value: '3', sub: 'View jobs', icon: 'user-x', color: 'violet', readOnly: true },
  { title: 'Jobs Blocked', value: '2', sub: 'View blocked', icon: 'ban', color: 'red', readOnly: true },
  { title: 'Labour Hrs Scheduled', value: '—', sub: 'vs budget', icon: 'clock', color: 'slate', upcoming: true },
];

const CAL_DAYS = ['Mon 12 May', 'Tue 13 May', 'Wed 14 May', 'Thu 15 May', 'Fri 16 May', 'Sat 17 May', 'Sun 18 May'];
const TECHS = [
  { name: 'Brendan Lee', state: 'On Site', jobs: 6, done: 1, hrs: '8:00' },
  { name: 'Jake Murray', state: 'On Site', jobs: 5, done: 1, hrs: '7:30' },
  { name: 'Liam Smith', state: 'Travelling', jobs: 4, done: 0, hrs: '7:15' },
  { name: 'Michael Davis', state: 'On Site', jobs: 5, done: 0, hrs: '7:45' },
  { name: 'David Brown', state: 'On Break', jobs: 3, done: 0, hrs: '4:30' },
  { name: 'Anthony White', state: 'On Site', jobs: 4, done: 1, hrs: '6:50' },
];
// job blocks keyed by tech index → array of {day, time, title, client, loc, state}
const CAL_JOBS = {
  0: [ {day:0,time:'8:00 AM – 12:00 PM',title:'CCTV Upgrade',client:'ABC Corporate',loc:'Level 1',state:'In Progress'},
       {day:1,time:'8:30 AM – 4:30 PM',title:'Access Control Install',client:'XYZ Building',loc:'Level 2',state:'Blocked',reason:'No approved quote — awaiting customer acceptance'},
       {day:2,time:'7:30 AM – 3:30 PM',title:'Camera Maintenance',client:'ABC Corporate',loc:'Level 1',state:'In Progress',sharedFj:'FJ-000402'},
       {day:3,time:'8:00 AM – 4:00 PM',title:'NVR Replacement',client:'ABC Corporate',loc:'Level 1',state:'In Progress'},
       {day:4,time:'8:00 AM – 12:00 PM',title:'Service Call',client:'ABC Corporate',loc:'Level 1',state:'Ready',fromSt:'ST-000101'} ],
  1: [ {day:0,time:'7:30 AM – 3:30 PM',title:'Electrical Rough In',client:'BuildCo Group',loc:'Warehouse',state:'In Progress'},
       {day:1,time:'7:30 AM – 3:30 PM',title:'Lighting Install',client:'BuildCo Group',loc:'Warehouse',state:'In Progress'},
       {day:2,time:'7:30 AM – 3:30 PM',title:'Switchboard Install',client:'BuildCo Group',loc:'Warehouse',state:'In Progress'},
       {day:3,time:'7:30 AM – 3:30 PM',title:'Power Testing',client:'BuildCo Group',loc:'Warehouse',state:'Planned'},
       {day:4,time:'7:30 AM – 3:30 PM',title:'Defects',client:'BuildCo Group',loc:'Warehouse',state:'Planned'} ],
  2: [ {day:0,time:'9:00 AM – 11:00 AM',title:'Site Inspection',client:"St. Mary's College",loc:'Main Campus',state:'Planned'},
       {day:1,time:'11:30 AM – 1:30 PM',title:'Quote Follow Up',client:'Retail Group',loc:'Head Office',state:'Planned'},
       {day:2,time:'2:00 PM – 4:30 PM',title:'Client Meeting',client:'Fusion Manufacturing',loc:'Factory 2',state:'Planned'},
       {day:3,time:'9:00 AM – 3:00 PM',title:'Site Investigation',client:'ABC Corporate',loc:'Level 3',state:'Planned'} ],
  3: [ {day:0,time:'8:00 AM – 4:30 PM',title:'Automation Install',client:'Fusion Manufacturing',loc:'Factory 1',state:'In Progress'},
       {day:1,time:'8:00 AM – 4:30 PM',title:'PLC Programming',client:'Fusion Manufacturing',loc:'Factory 1',state:'In Progress'},
       {day:2,time:'8:00 AM – 4:30 PM',title:'System Testing',client:'Fusion Manufacturing',loc:'Factory 1',state:'In Progress'},
       {day:3,time:'8:00 AM – 4:30 PM',title:'HMI Setup',client:'Fusion Manufacturing',loc:'Factory 1',state:'In Progress'},
       {day:4,time:'8:00 AM – 12:00 PM',title:'Handover',client:'Fusion Manufacturing',loc:'Factory 1',state:'Planned'} ],
  4: [ {day:1,time:'9:00 AM – 1:00 PM',title:'Maintenance',client:'ABC Corporate',loc:'Level 1',state:'Planned'},
       {day:3,time:'1:30 PM – 4:30 PM',title:'Maintenance',client:'ABC Corporate',loc:'Level 1',state:'Planned'} ],
  5: [ {day:0,time:'7:00 AM – 11:00 AM',title:'Preventative Maintenance',client:'Retail Group',loc:'Store 45',state:'Planned'},
       {day:1,time:'11:30 AM – 3:30 PM',title:'Preventative Maintenance',client:'Retail Group',loc:'Store 47',state:'Planned'},
       {day:2,time:'7:30 AM – 11:30 AM',title:'Camera Maintenance',client:'ABC Corporate',loc:'Level 1',state:'In Progress',sharedFj:'FJ-000402'},
       {day:2,time:'1:00 PM – 4:00 PM',title:'Alarm Service',client:'Retail Group',loc:'Store 48',state:'Overdue',reason:'Ran past scheduled window — not yet closed out'},
       {day:3,time:'12:30 PM – 4:30 PM',title:'Intercom Replace',client:'Retail Group',loc:'Store 50',state:'Cancelled',reason:'Customer cancelled — rescheduling next week'} ],
};
const CAL_UNASSIGNED = [
  {day:0,time:'9:00 AM – 1:00 PM',title:'CCTV Fault',client:'ABC Corporate',loc:'Level 2',state:'Unassigned',whyNot:'No technician with CCTV licence available',fromSt:'ST-000099'},
  {day:1,time:'1:30 PM – 4:30 PM',title:'Access Control Fault',client:'ABC Corporate',loc:'Level 1',state:'Unassigned',whyNot:'Awaiting parts — controller on back-order'},
  {day:5,time:'9:00 AM – 1:00 PM',title:'NVR Not Recording',client:'ABC Corporate',loc:'Level 1',state:'Unassigned',whyNot:'Outside business hours — no weekend cover'},
];

// ---- Timesheets ----
const TIMESHEET_KPIS = [
  { title: 'Total Hours', value: '243.25', sub: 'This Week', icon: 'clock', color: 'blue' },
  { title: 'Billable Hours', value: '198.50', sub: '81.6% — View report', icon: 'dollar-sign', color: 'green' },
  { title: 'Non-Billable Hours', value: '44.75', sub: '18.4% — View report', icon: 'clock', color: 'orange' },
  { title: 'Pending Approval', value: '18.25', sub: '7 timesheets — View list', icon: 'user-check', color: 'violet' },
  { title: 'Rejected Hours', value: '6.50', sub: '2 timesheets — View list', icon: 'x-circle', color: 'red' },
  { title: 'Approved Hours', value: '219.00', sub: 'This Week — View report', icon: 'check-circle-2', color: 'slate' },
];

const TIMESHEETS = [
  { tech: 'Brendan Lee', id: 'USR-000012', total: '38.00', billable: '32.00', billablePct: 84, nonBillable: '6.00', nonBillablePct: 16, status: 'Approved',
    week: '12 – 18 May 2026', overtime: '0.00', standard: '38.00', breaks: '2.30',
    entries: [
      { day: 'Mon, 12 May', job: 'FJ-001052 – CCTV Upgrade', loc: 'ABC Corporate – Level 1', time: '7:30 AM – 4:30 PM', brk: '0:30', hrs: '8.50', type: 'Billable', status: 'Approved' },
      { day: 'Tue, 13 May', job: 'FJ-001053 – Access Control', loc: 'ABC Corporate – Level 2', time: '7:45 AM – 4:15 PM', brk: '0:30', hrs: '8.00', type: 'Billable', status: 'Approved' },
      { day: 'Wed, 14 May', job: 'FJ-001052 – CCTV Upgrade', loc: 'ABC Corporate – Level 1', time: '7:30 AM – 3:30 PM', brk: '0:30', hrs: '7.50', type: 'Billable', status: 'Approved' },
      { day: 'Thu, 15 May', job: 'FJ-001054 – Fault Investig.', loc: 'ABC Corporate – Car Park', time: '8:00 AM – 2:30 PM', brk: '0:30', hrs: '6.00', type: 'Billable', status: 'Approved' },
      { day: 'Fri, 16 May', job: 'Admin / Documentation', loc: 'Office', time: '9:00 AM – 12:00 PM', brk: '—', hrs: '2.00', type: 'Non-Billable', status: 'Approved' },
      { day: 'Sat, 17 May', job: 'Call Back – Camera Adjust', loc: 'ABC Corporate – Level 1', time: '8:00 AM – 10:00 AM', brk: '—', hrs: '2.00', type: 'Billable', status: 'Approved' },
      { day: 'Sun, 18 May', job: '—', loc: '', time: '', brk: '', hrs: '', type: '', status: '' },
    ] },
  { tech: 'Jake Murray', id: 'USR-000013', total: '38.75', billable: '32.25', billablePct: 83, nonBillable: '6.50', nonBillablePct: 17, status: 'Pending Approval',
    week: '12 – 18 May 2026', overtime: '0.00', standard: '38.75', breaks: '1.00', readiness: 'Missing break',
    entries: [
      { day: 'Mon, 12 May', job: 'FJ-001052 – CCTV Upgrade', loc: 'ABC Corporate – Level 1', time: '7:30 AM – 11:00 AM', brk: '—', hrs: '3.50', type: 'Billable', status: 'Approved', inv: 'Ready to invoice' },
      { day: 'Mon, 12 May', job: 'FJ-001056 – Intercom Fault', loc: "St Mary's College – Main", time: '11:30 AM – 2:00 PM', brk: '—', hrs: '2.50', type: 'Billable', status: 'Pending', inv: 'Not ready' },
      { day: 'Mon, 12 May', job: 'FJ-001061 – Access Reader Swap', loc: 'Retail Group – Store 47', time: '2:30 PM – 5:00 PM', brk: '—', hrs: '2.50', type: 'Billable', status: 'Pending', inv: 'In review' },
      { day: 'Tue, 13 May', job: 'FJ-001055 – NVR Install', loc: 'Retail Group – Store 47', time: '8:00 AM – 4:30 PM', brk: '0:30', hrs: '8.00', type: 'Billable', status: 'Approved', inv: 'Invoiced ✓' },
      { day: 'Wed, 14 May', job: 'Travel To Site', loc: '—', time: '6:30 AM – 7:30 AM', brk: '—', hrs: '1.00', type: 'Non-Billable', status: 'Approved', inv: '—' },
      { day: 'Wed, 14 May', job: 'FJ-001056 – Intercom Fault', loc: "St Mary's College – Main", time: '8:00 AM – 3:45 PM', brk: '0:30', hrs: '7.25', type: 'Billable', status: 'Pending', inv: 'Blocked' },
      { day: 'Fri, 16 May', job: 'Admin / Reporting', loc: 'Office', time: '9:00 AM – 1:00 PM', brk: '—', hrs: '4.00', type: 'Non-Billable', status: 'Pending', inv: '—' },
    ] },
  { tech: 'Liam Smith', id: 'USR-000014', total: '0.00', billable: '0.00', billablePct: 0, nonBillable: '0.00', nonBillablePct: 0, status: 'No Timesheet', readiness: 'No timesheet submitted', entries: [] },
  { tech: 'Michael Davis', id: 'USR-000015', total: '12.00', billable: '9.00', billablePct: 75, nonBillable: '3.00', nonBillablePct: 25, status: 'Rejected', readiness: 'Rejected — needs correction',
    week: '12 – 18 May 2026', overtime: '0.00', standard: '12.00', breaks: '0.30',
    entries: [
      { day: 'Mon, 12 May', job: 'FJ-001058 – Automation', loc: 'Fusion Mfg – Factory 1', time: '8:00 AM – 4:30 PM', brk: '0:30', hrs: '8.00', type: 'Billable', status: 'Rejected' },
      { day: 'Tue, 13 May', job: 'Admin / Reporting', loc: 'Office', time: '9:00 AM – 12:00 PM', brk: '—', hrs: '3.00', type: 'Non-Billable', status: 'Rejected' },
      { day: 'Wed, 14 May', job: 'FJ-001058 – Automation', loc: 'Fusion Mfg – Factory 1', time: '10:00 AM – 11:00 AM', brk: '—', hrs: '1.00', type: 'Billable', status: 'Rejected' },
    ] },
  { tech: 'David Brown', id: 'USR-000016', total: '9.50', billable: '9.50', billablePct: 100, nonBillable: '0.00', nonBillablePct: 0, status: 'Pending Approval', readiness: 'Missing job link',
    week: '12 – 18 May 2026', overtime: '0.00', standard: '9.50', breaks: '0.30',
    entries: [
      { day: 'Mon, 12 May', job: 'FJ-001062 – Camera Reposition', loc: 'ABC Corporate – Level 3', time: '8:00 AM – 1:00 PM', brk: '0:30', hrs: '4.50', type: 'Billable', status: 'Approved', inv: 'Ready to invoice' },
      { day: 'Tue, 13 May', job: 'Unlinked site work', loc: 'ABC Corporate – Level 3', time: '8:30 AM – 1:30 PM', brk: '0:30', hrs: '5.00', type: 'Billable', status: 'Pending', inv: 'Not ready', noLink: true },
    ] },
  { tech: 'Anthony White', id: 'USR-000017', total: '46.50', billable: '40.00', billablePct: 86, nonBillable: '6.50', nonBillablePct: 14, status: 'Pending Approval', readiness: 'Overtime review',
    week: '12 – 18 May 2026', overtime: '6.50', standard: '40.00', breaks: '2.30',
    entries: [
      { day: 'Mon, 12 May', job: 'FJ-001064 – After-hours Cutover', loc: 'Fusion Mfg – Factory 1', time: '6:00 AM – 6:30 PM', brk: '0:30', hrs: '12.00', type: 'Billable', status: 'Pending', inv: 'Not ready', ot: true },
      { day: 'Tue, 13 May', job: 'FJ-001064 – After-hours Cutover', loc: 'Fusion Mfg – Factory 1', time: '6:00 AM – 5:30 PM', brk: '0:30', hrs: '11.00', type: 'Billable', status: 'Pending', inv: 'Not ready', ot: true },
      { day: 'Wed, 14 May', job: 'FJ-001065 – Commissioning', loc: 'Fusion Mfg – Factory 1', time: '7:00 AM – 3:30 PM', brk: '0:30', hrs: '8.00', type: 'Billable', status: 'Approved', inv: 'Ready to invoice' },
    ] },
  { tech: 'Priya Nair', id: 'USR-000018', total: '31.00', billable: '24.50', billablePct: 79, nonBillable: '6.50', nonBillablePct: 21, status: 'Pending Approval', readiness: 'Invoice blocked',
    week: '12 – 18 May 2026', overtime: '0.00', standard: '31.00', breaks: '1.30',
    entries: [
      { day: 'Mon, 12 May', job: 'FJ-001067 – Switch Replacement', loc: 'Retail Group – Store 47', time: '8:00 AM – 4:30 PM', brk: '0:30', hrs: '8.00', type: 'Billable', status: 'Approved', inv: 'Blocked' },
      { day: 'Tue, 13 May', job: 'FJ-001067 – Switch Replacement', loc: 'Retail Group – Store 47', time: '8:00 AM – 4:00 PM', brk: '0:30', hrs: '7.50', type: 'Billable', status: 'Approved', inv: 'Blocked' },
      { day: 'Wed, 14 May', job: 'Admin / Reporting', loc: 'Office', time: '9:00 AM – 1:00 PM', brk: '—', hrs: '4.00', type: 'Non-Billable', status: 'Approved', inv: '—' },
    ] },
];

// Map technicians to platform user ids (display chip; internal id stays for state).
TIMESHEETS.forEach((t, i) => { t.usr = 'USR-' + String(12 + i).padStart(6, '0'); });

// Augment calendar jobs with system-assigned visit/job ids, priority & site address.
(function () {
  const ADDR = {
    'ABC Corporate': '123 George St, Sydney NSW',
    'XYZ Building': '88 Market St, Sydney NSW',
    'BuildCo Group': 'Unit 4, 210 Parramatta Rd, NSW',
    "St. Mary's College": '5 College Ave, Brisbane QLD',
    'Retail Group': 'Westfield, 159 Pitt St, Sydney NSW',
    'Fusion Manufacturing': '12 Industrial Dr, Adelaide SA',
  };
  const PRIOS = ['High', 'Medium', 'Low', 'Medium', 'Low', 'High'];
  const SKILLS = ['CCTV', 'Access Control', 'Electrical', 'Networking', 'Alarms'];
  const LICENCES = ['Security Licence 1A', 'Electrical (A-Grade)', 'Working at Heights', 'Cabling (ACMA)'];
  let sd = 91, fj = 310, i = 0;
  const all = [].concat(...Object.values(CAL_JOBS), CAL_UNASSIGNED);
  all.forEach((j) => {
    j.sd = 'SD-' + String(sd++).padStart(6, '0');
    j.fj = j.sharedFj || ('FJ-' + String(fj++).padStart(6, '0'));
    j.prio = j.state === 'Unassigned' ? 'High' : PRIOS[i % PRIOS.length];
    j.addr = ADDR[j.client] || j.loc;
    j.estHours = [3, 4, 6, 8, 7.5, 4.5][i % 6];
    j.skills = [SKILLS[i % SKILLS.length], SKILLS[(i + 2) % SKILLS.length]];
    j.licences = [LICENCES[i % LICENCES.length]];
    j.siteAccess = ['Reception sign-in · escort required', 'Key safe — code on file', 'After-hours access via security', 'Loading dock — call site contact'][i % 4];
    // explicit per-visit readiness (typed blockers vary the spread; no blanks)
    const RDY = ['Ready', 'Planned', 'In Progress', 'At Risk', 'Needs Review', 'Parts Missing', 'Access Missing', 'Skills Missing', 'Client Not Confirmed', 'Overtime Risk', 'Travel Conflict'];
    j.readiness = j.state === 'Blocked' ? 'Parts Missing' : j.state === 'Ready' ? 'Ready' : j.state === 'In Progress' ? 'In Progress' : j.state === 'Overdue' ? 'At Risk' : j.state === 'Cancelled' ? 'Needs Review' : j.state === 'Unassigned' ? RDY[5 + (i % 6)] : RDY[i % RDY.length];
    // per-card check signals (skills, access, parts, client, travel, asset)
    const block = ['Parts Missing', 'Access Missing', 'Skills Missing', 'Client Not Confirmed', 'Travel Conflict'].indexOf(j.readiness);
    j.checks = { skills: block !== 2, access: block !== 1, parts: block !== 0, client: block !== 3, travel: block !== 4, asset: i % 4 !== 0 };
    j.blocker = j.readiness === 'Ready' || j.readiness === 'Planned' || j.readiness === 'In Progress' ? null
      : { 'Parts Missing': '1× NVR-8CH not allocated', 'Access Missing': 'Site key not collected', 'Skills Missing': 'No CCTV licence on tech', 'Client Not Confirmed': 'Awaiting client confirmation', 'Overtime Risk': 'May exceed standard hours', 'Travel Conflict': 'Overlaps prior visit travel', 'At Risk': 'Ran past scheduled window', 'Needs Review': 'Manual review required' }[j.readiness];
    i++;
  });
  // per-technician capacity (scheduled / available, billable vs travel, idle gap)
  const CAP = [
    { sched: 18.0, avail: 38.0, billable: 15.0, travel: 3.0, gap: '12:00–1:00 PM' },
    { sched: 16.5, avail: 38.0, billable: 14.0, travel: 2.5, gap: '3:00–4:30 PM' },
    { sched: 9.0, avail: 38.0, billable: 6.5, travel: 2.5, gap: '11:00 AM–2:00 PM' },
    { sched: 32.5, avail: 38.0, billable: 30.0, travel: 2.5, gap: 'None' },
    { sched: 7.5, avail: 24.0, billable: 5.0, travel: 2.5, gap: '1:00–3:00 PM' },
    { sched: 20.0, avail: 38.0, billable: 17.5, travel: 2.5, gap: '9:30–10:30 AM' },
  ];
  TECHS.forEach((t, k) => { t.capacity = CAP[k % CAP.length]; });
})();

Object.assign(window, {
  NAV, PROJECT_KPIS, PROJECTS, TICKET_KPIS, TICKETS, TICKETS_NEEDS_REVIEW, ASSET_KPIS, ASSETS,
  ISSUE_TYPES, SOURCES, CUSTOMER_IMPACT, JOB_CLASSIFICATIONS, PRIORITIES, SAMPLE_CUSTOMERS,
  PROJECT_CLIENTS, PROJECT_OWNERS, PROJECT_SERVICE_TYPES, PROJECT_STATUSES, PROJECT_SUPPLIERS, PROJECT_SKILLS, SAMPLE_QUOTE, FIELD_JOBS,
  CAL_KPIS, CAL_DAYS, TECHS, CAL_JOBS, CAL_UNASSIGNED, ASSET_KPIS2,
  TIMESHEET_KPIS, TIMESHEETS,
});

// Augment assets with system asset id (EG-NNNN), brand/manufacturer & criticality.
(function () {
  const BRAND = (m) => {
    const s = (m || '').toLowerCase();
    if (s.includes('hik')) return 'Hikvision';
    if (s.includes('cisco')) return 'Cisco';
    if (s.includes('hid')) return 'HID Global';
    if (s.includes('bosch')) return 'Bosch';
    if (s.includes('2n')) return '2N';
    if (s.includes('apc')) return 'APC by Schneider';
    if (s.includes('dahua')) return 'Dahua';
    return 'Generic';
  };
  const CRIT = ['High', 'Medium', 'High', 'Medium', 'High', 'Low', 'Medium', 'Low', 'High', 'Medium'];
  ASSETS.forEach((a, i) => {
    a.eg = 'EG-' + String(42 + i).padStart(4, '0');
    a.brand = BRAND(a.model);
    a.criticality = a.criticality || CRIT[i % CRIT.length];
  });
})();

// ---- Procurement / Financial Reconciliation ----
const RECON_KPIS = [
  { title: 'Bank Transactions', value: '126', sub: '$215,480.65 — View all', icon: 'landmark', color: 'blue' },
  { title: 'Supplier Invoices', value: '98', sub: '$209,350.40 — View all', icon: 'file-text', color: 'green' },
  { title: 'Potential Matches', value: '56', sub: '$102,430.20 — View all', icon: 'link', color: 'orange' },
  { title: 'Pending Verification', value: '18', sub: '$34,280.75 — View all', icon: 'user-check', color: 'violet' },
  { title: 'Exceptions', value: '11', sub: '$22,650.80 — View all', icon: 'alert-triangle', color: 'red' },
  { title: 'Verified (This Month)', value: '72', sub: '$152,870.60 — View report', icon: 'check-circle-2', color: 'slate' },
];
const RECON_TABS = [['All Items', 126], ['Potential Matches', 56], ['Pending Verification', 18], ['Verified', 22], ['Manager Review', 6], ['Exceptions', 11], ['Unallocated', 13]];
const RECON_ROWS = [
  { id: 'r1', im: 'IM-000061', status: 'Pending Verification', priority: 'High', bankDate: '15 May 2026', bankAmt: '$4,560.00', bankRef: 'BTX-000204', bankAcct: 'Westpac Business', supplier: 'TechVision Wholesale', si: 'SI-000088', invDate: '16 May 2026', invAmt: '$4,560.00', invSub: '$4,145.45', invGst: '$414.55', gstFree: false, conf: 95, project: 'PRJ-000142', cc: 'CC-000045', site: 'ABC Corporate · Level 1 Refurb', days: '1 day' },
  { id: 'r2', im: 'IM-000062', status: 'Verified', priority: 'Medium', bankDate: '14 May 2026', bankAmt: '$6,732.00', bankRef: 'BTX-000205', bankAcct: 'ANZ Business', supplier: 'ACME Security Pty Ltd', si: 'SI-000089', invDate: '14 May 2026', invAmt: '$6,732.00', invSub: '$6,120.00', invGst: '$612.00', conf: 97, project: 'PRJ-000144', cc: 'CC-000051', site: 'BuildCo Group · Head Office', days: '0 days' },
  { id: 'r3', im: 'IM-000063', status: 'Potential Match', priority: 'Medium', bankDate: '14 May 2026', bankAmt: '$2,845.50', bankRef: 'BTX-000206', bankAcct: 'Westpac Business', supplier: 'Hikvision Australia', si: 'SI-000090', invDate: '15 May 2026', invAmt: '$2,845.50', invSub: '$2,586.82', invGst: '$258.68', conf: 88, project: 'PRJ-000145', cc: 'CC-000046', site: 'RetailCo Solutions · Store 47', days: '1 day' },
  { id: 'r4', im: 'IM-000064', status: 'Manager Review', priority: 'High', bankDate: '13 May 2026', bankAmt: '$1,980.00', bankRef: 'BTX-000207', bankAcct: 'CommBank Business', supplier: 'Dahua Technology', si: 'SI-000091', invDate: '13 May 2026', invAmt: '$1,980.00', invSub: '$1,800.00', invGst: '$180.00', conf: 72, project: 'PRJ-000145', cc: 'CC-000046', site: 'RetailCo Solutions · Store 47', days: '0 days', marginFlag: true },
  { id: 'r5', im: 'IM-000065', status: 'Exception', priority: 'High', exType: 'Amount mismatch', bankDate: '12 May 2026', bankAmt: '$3,215.00', bankRef: 'BTX-000208', bankAcct: 'Westpac Business', supplier: 'Bosch Security Systems', si: 'SI-000092', invDate: '12 May 2026', invAmt: '$3,680.00', invSub: '$3,345.45', invGst: '$334.55', conf: 0, confLabel: 'Low', project: 'PRJ-000142', cc: 'CC-000045', site: "St Mary's College · Maintenance", days: '0 days' },
  { id: 'r6', im: 'IM-000066', status: 'Pending Verification', priority: 'Low', bankDate: '12 May 2026', bankAmt: '$2,150.00', bankRef: 'BTX-000209', bankAcct: 'NAB Business', supplier: 'Aircon Solutions', si: 'SI-000093', invDate: '12 May 2026', invAmt: '$2,150.00', invSub: '$2,150.00', invGst: '$0.00', gstFree: true, conf: 99, project: 'PRJ-000147', cc: 'CC-000058', site: 'DevGroup Holdings · Warehouse', days: '0 days' },
  { id: 'r7', im: 'IM-000067', status: 'Partially Allocated', priority: 'Low', bankDate: '11 May 2026', bankAmt: '$580.80', bankRef: 'BTX-000210', bankAcct: 'CommBank Business', supplier: 'CableCore Solutions', si: 'SI-000094', invDate: '11 May 2026', invAmt: '$580.80', invSub: '$528.00', invGst: '$52.80', conf: 68, confLabel: 'Weak', project: '—', cc: '—', site: 'Not Allocated', days: '0 days', splitAlloc: true, noPo: true },
  { id: 'r8', im: 'IM-000068', status: 'Pending Verification', priority: 'Medium', bankDate: '11 May 2026', bankAmt: '$1,245.00', bankRef: 'BTX-000211', bankAcct: 'Westpac Business', supplier: 'Schneider Electric', si: 'SI-000095', invDate: '11 May 2026', invAmt: '$1,245.00', invSub: '$1,131.82', invGst: '$113.18', conf: 82, confLabel: 'Likely', project: 'PRJ-000142', cc: 'CC-000045', site: 'ABC Corporate · Level 1 Refurb', days: '0 days' },
];
// quoted vs actual line comparison (engine output — preview)
const RECON_QVA = [
  ['CCTV Cameras ×8', '$3,600.00', '$3,840.00', '+$240.00'],
  ['Mounting Hardware', '$320.00', '$300.00', '−$20.00'],
  ['Cabling (per m)', '$225.45', '$420.00', '+$194.55'],
];
const RECON_CHECKLIST = [
  ['Bank transaction exists', 'done'], ['Invoice exists', 'done'], ['Amounts match', 'done'], ['Manually verified', 'done'],
  ['GST verified', 'pending'], ['Supplier verified', 'pending'], ['Line items reviewed', 'pending'], ['Quantities verified', 'pending'],
  ['Project allocated', 'done'], ['Cost centre allocated', 'pending'], ['Duplicate checked', 'pending'], ['Payment method valid', 'pending'],
  ['PO / Reference verified', 'pending'], ['Margin impact reviewed', 'pending'], ['Notes added', 'pending'],
];
const RECON_EXCEPTIONS = [
  ['Missing Invoices', '5 transactions', '$9,870.50'], ['Missing Bank Match', '3 invoices', '$7,210.30'], ['Amount Mismatch', '2 transactions', '$3,450.00'],
  ['Quantity Variance', '4 transactions', '$4,890.00'], ['Duplicate Detected', '1 transaction', '$1,230.00'], ['Total Exceptions', '11 transactions', '$22,650.80'],
];
const RECON_RULES = [
  { text: 'Both bank transaction AND supplier invoice must exist', enforced: true },
  { text: 'Amounts must match 100% (including GST)', enforced: true },
  { text: 'Manual verification required for all matches', enforced: true },
  { text: 'Only verified items impact project financials', enforced: true },
  { text: 'Quantities and line items must be reviewed', enforced: false },
  { text: 'Duplicate invoices or payments are blocked', enforced: false },
  { text: 'Item must be allocated to a project and cost centre', enforced: false },
];

// ---- Invoice Matching (Bank Feed) ----
const MATCH_KPIS = [
  { title: 'Bank Transactions', value: '126', sub: 'Unmatched · $251,480.65', icon: 'landmark', color: 'blue', preview: true },
  { title: 'Invoices', value: '98', sub: 'Unmatched · $209,350.40', icon: 'file-text', color: 'green', readOnly: true },
  { title: 'Potential Matches', value: '56', sub: 'Auto Matched · $102,430.20', icon: 'link', color: 'orange', preview: true },
  { title: 'Pending Review', value: '18', sub: 'Manual Check · $34,280.75', icon: 'user-check', color: 'violet', preview: true },
  { title: 'Exceptions', value: '11', sub: 'Require Attention · $22,650.80', icon: 'alert-triangle', color: 'red', preview: true },
  { title: 'Matched', value: '72', sub: 'Ready for Reconciliation', icon: 'check-circle-2', color: 'slate', preview: true },
];
const MATCH_TABS = [['All', 389], ['Unmatched Bank', 126], ['Unmatched Invoices', 98], ['Potential Matches', 56], ['Pending Review', 18], ['Exceptions', 11], ['Matched', 72], ['Ready for Reconciliation', 31], ['Match Rejected', 4]];
const MATCH_ROWS = [
  { id: 'm1', im: 'IM-000061', status: 'Potential Match', conf: 95, ocr: 98, bankDate: '16 May 2026', bankDesc: 'TechVision Wholesale', bankRef: 'BTX-000204', account: 'Westpac Business Cheque', bankAmt: '$4,560.00', supplier: 'TechVision Wholesale', si: 'SI-000088', inv: 'INV-55421', invDate: '16 May 2026', invAmt: '$4,560.00', invSub: '$4,145.45', invGst: '$414.55' },
  { id: 'm2', im: 'IM-000062', status: 'Pending Review', conf: 78, ocr: 84, bankDate: '15 May 2026', bankDesc: 'ACME SECURITY PTY LTD', bankRef: 'BTX-000205', account: 'Westpac Business Cheque', bankAmt: '$6,732.00', supplier: 'ACME Security Pty Ltd', si: 'SI-000089', inv: 'INV-22110', invDate: '14 May 2026', invAmt: '$6,732.00', invSub: '$6,120.00', invGst: '$612.00' },
  { id: 'm3', im: 'IM-000063', status: 'Unmatched Bank', conf: null, bankDate: '15 May 2026', bankDesc: 'BUNNINGS WAREHOUSE', bankRef: 'BTX-000206', account: 'Westpac Business Cheque', bankAmt: '$326.80', supplier: 'Bunnings Warehouse', si: null, inv: '—', invDate: '—', invAmt: '—', action: 'request', supplierContactMissing: true },
  { id: 'm4', im: 'IM-000064', status: 'Potential Match', conf: 88, ocr: 90, split: true, bankDate: '14 May 2026', bankDesc: 'HIKVISION AUSTRALIA', bankRef: 'BTX-000207', account: 'Westpac Business Cheque', bankAmt: '$2,845.50', supplier: 'Hikvision Australia', si: 'SI-000090', inv: 'INV-88765 + INV-88766', invDate: '15 May 2026', invAmt: '$2,845.50', invSub: '$2,586.82', invGst: '$258.68' },
  { id: 'm5', im: 'IM-000065', status: 'Exception', exType: 'GST mismatch', conf: 72, ocr: 61, gstMismatch: true, bankDate: '13 May 2026', bankDesc: 'DAHUA TECHNOLOGY', bankRef: 'BTX-000208', account: 'CommBank Business', bankAmt: '$1,980.00', supplier: 'Dahua Technology', si: 'SI-000091', inv: 'INV-44657', invDate: '13 May 2026', invAmt: '$1,980.00', invSub: '$1,818.00', invGst: '$162.00' },
  { id: 'm6', im: 'IM-000066', status: 'Exception', exType: 'Amount mismatch', conf: 91, ocr: 88, bankDate: '12 May 2026', bankDesc: 'BOSCH SECURITY', bankRef: 'BTX-000209', account: 'Westpac Business Cheque', bankAmt: '$3,215.00', supplier: 'Bosch Security Systems', si: 'SI-000092', inv: 'INV-99001', invDate: '12 May 2026', invAmt: '$3,680.00', invSub: '$3,345.45', invGst: '$334.55', mismatch: true },
  { id: 'm7', im: 'IM-000067', status: 'Unmatched Invoice', conf: null, bankDate: '—', bankDesc: '—', bankRef: '—', account: '—', bankAmt: '—', supplier: 'Aircon Solutions', si: 'SI-000093', inv: 'INV-55621', invDate: '12 May 2026', invAmt: '$2,150.00', invSub: '$1,954.55', invGst: '$195.45', action: 'find' },
  { id: 'm8', im: 'IM-000068', status: 'Exception', exType: 'Possible personal expense', conf: 38, ocr: 55, bankDate: '11 May 2026', bankDesc: 'CITY CAFE & BAR', bankRef: 'BTX-000210', account: 'CommBank Business Visa', bankAmt: '$184.20', supplier: 'City Cafe & Bar', si: null, inv: '—', invDate: '—', invAmt: '—', action: 'request' },
  { id: 'm9', im: 'IM-000069', status: 'Exception', exType: 'Supplier mismatch', conf: 52, ocr: 70, bankDate: '11 May 2026', bankDesc: 'SECURITY DISTRIBUTORS', bankRef: 'BTX-000211', account: 'Westpac Business Cheque', bankAmt: '$910.00', supplier: 'ACME Security Pty Ltd', si: 'SI-000095', inv: 'INV-30221', invDate: '10 May 2026', invAmt: '$910.00', invSub: '$827.27', invGst: '$82.73', mismatch: false },
  { id: 'm10', im: 'IM-000070', status: 'Partial Payment', conf: 96, ocr: 93, partial: true, bankDate: '10 May 2026', bankDesc: 'FUSION SUPPLIES', bankRef: 'BTX-000212', account: 'Westpac Business Cheque', bankAmt: '$1,500.00', supplier: 'Fusion Supplies', si: 'SI-000096', inv: 'INV-71200', invDate: '08 May 2026', invAmt: '$3,000.00', invSub: '$2,727.27', invGst: '$272.73' },
  { id: 'm11', im: 'IM-000071', status: 'Ready for Reconciliation', conf: 99, ocr: 99, bankDate: '10 May 2026', bankDesc: 'CABLECORE SOLUTIONS', bankRef: 'BTX-000213', account: 'Westpac Business Cheque', bankAmt: '$580.80', supplier: 'CableCore Solutions', si: 'SI-000097', inv: 'INV-19020', invDate: '09 May 2026', invAmt: '$580.80', invSub: '$528.00', invGst: '$52.80' },
  { id: 'm12', im: 'IM-000072', status: 'Match Rejected', conf: 64, ocr: 72, bankDate: '09 May 2026', bankDesc: 'GENERIC HARDWARE', bankRef: 'BTX-000214', account: 'CommBank Business Visa', bankAmt: '$245.00', supplier: 'Generic Hardware', si: 'SI-000098', inv: 'INV-10044', invDate: '02 May 2026', invAmt: '$245.00', invSub: '$222.73', invGst: '$22.27', reason: 'Rejected — wrong supplier on review' },
];
const MATCH_RULES = ['Supplier name similarity', 'Amount within $2.00 or 0.5% tolerance', 'Date within 14 days', 'Reference / invoice number match', 'PO number match', 'ABN match', 'Payment method match'];
const MATCH_ACTIVITY = [
  ['Auto matched: INV-55421 to BTX-000204', '16 May 2026 09:15 AM', 'check-circle-2', 'hsl(var(--success))'],
  ['Invoice INV-88765 uploaded', '15 May 2026 03:22 PM', 'upload', 'hsl(var(--info))'],
  ['Bank feed synced', '15 May 2026 02:10 PM', 'refresh-cw', 'hsl(var(--muted-foreground))'],
  ['Manual match confirmed: INV-22110', '14 May 2026 11:47 AM', 'check', 'hsl(var(--success))'],
  ['Invoice request sent to Bunnings', '14 May 2026 10:02 AM', 'mail', 'hsl(var(--warning))'],
];

Object.assign(window, {
  RECON_KPIS, RECON_TABS, RECON_ROWS, RECON_CHECKLIST, RECON_EXCEPTIONS, RECON_RULES, RECON_QVA,
  MATCH_KPIS, MATCH_TABS, MATCH_ROWS, MATCH_RULES, MATCH_ACTIVITY,
});
