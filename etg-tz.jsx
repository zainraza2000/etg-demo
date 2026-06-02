// ETG Dashboard — shared timezone model & formatter.
// Model: store UTC, show LOCAL. Times display primary in the SITE zone with a
// human label (never a raw offset); when the viewer's zone differs, a muted
// secondary "your time" line is shown. Date-only fields never get a clock.
// (Demo offsets reflect AU eastern-DST so the cross-state case is visible.)

const VIEWER_ZONE = 'Australia/Brisbane'; // company / head-office baseline (QLD)

const TZ = {
  'Australia/Sydney':    { off: 660, abbr: 'NSW', city: 'Sydney' },
  'Australia/Melbourne': { off: 660, abbr: 'VIC', city: 'Melbourne' },
  'Australia/Hobart':    { off: 660, abbr: 'TAS', city: 'Hobart' },
  'Australia/Brisbane':  { off: 600, abbr: 'QLD', city: 'Brisbane' },
  'Australia/Adelaide':  { off: 630, abbr: 'SA',  city: 'Adelaide' },
  'Australia/Darwin':    { off: 570, abbr: 'NT',  city: 'Darwin' },
  'Australia/Perth':     { off: 480, abbr: 'WA',  city: 'Perth' },
};
const tzAbbr = (z) => (TZ[z] || TZ[VIEWER_ZONE]).abbr;
const tzCity = (z) => (TZ[z] || TZ[VIEWER_ZONE]).city;

// Map a client / site name to its IANA site zone.
const SITE_ZONE = {
  'ABC Corporate': 'Australia/Sydney',
  'Retail Group': 'Australia/Sydney',
  'RetailCo Solutions': 'Australia/Sydney',
  'TechVision Wholesale': 'Australia/Sydney',
  'Fashion Retailers': 'Australia/Sydney',
  'BuildCo Group': 'Australia/Sydney',
  'Kingston Logistics': 'Australia/Melbourne',
  "St Mary's College": 'Australia/Brisbane',
  "St. Mary's College": 'Australia/Brisbane',
  'Fusion Manufacturing': 'Australia/Adelaide',
  'Fusion Mfg': 'Australia/Adelaide',
  'DevGroup Holdings': 'Australia/Adelaide',
  'Office': 'Australia/Brisbane',
};
function siteZoneFor(name) {
  if (!name) return VIEWER_ZONE;
  if (SITE_ZONE[name]) return SITE_ZONE[name];
  const k = Object.keys(SITE_ZONE).find((c) => name.indexOf(c) !== -1);
  return k ? SITE_ZONE[k] : VIEWER_ZONE;
}

// ---- clock math on "h:mm AM" strings ----
function parseClock(s) {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(s);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12; if (/PM/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}
function fmtClock(mins) {
  mins = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(mins / 60); const mm = mins % 60;
  const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
}
// shift every clock token in a string (handles ranges "8:00 AM – 4:30 PM")
function shiftTimes(str, deltaMin) {
  return str.replace(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi, (tok) => fmtClock(parseClock(tok) + deltaMin));
}

// <SiteTime> — primary in site zone + muted "your time" line when viewer differs.
// time: a clock string or range ("8:00 AM – 12:00 PM"); zone: IANA site zone.
function SiteTime({ time, zone, viewer = VIEWER_ZONE, primaryColor, small, oneline }) {
  if (!time || !parseClock(time)) return <span>{time}</span>;
  const site = TZ[zone] || TZ[viewer]; const vw = TZ[viewer];
  const differ = site.off !== vw.off;
  const delta = vw.off - site.off; // site time + delta = viewer time
  const primary = <span style={{ color: primaryColor }}>{time} <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{site.abbr} time</span></span>;
  if (!differ) return primary;
  const secondary = <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: small ? 10.5 : 11 }}>{shiftTimes(time, delta)} your time ({vw.abbr})</span>;
  if (oneline) return <span>{primary} <span style={{ color: 'hsl(var(--muted-foreground))' }}>· </span>{secondary}</span>;
  return <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.35 }}>{primary}{secondary}</span>;
}
// company/head-office timestamp (finance views) — single Brisbane label, no dual.
function CoTime({ time }) {
  return <span>{time} <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>Brisbane time</span></span>;
}

Object.assign(window, { VIEWER_ZONE, TZ, tzAbbr, tzCity, SITE_ZONE, siteZoneFor, shiftTimes, SiteTime, CoTime });
