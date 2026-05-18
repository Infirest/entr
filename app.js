/* ============================================================
   Sport Partner Finder — app.js  (v3 — fully fixed)
   Fixes: tab system, map lazy-init, account=profile,
          communities with join state + events + search,
          signup validation, duplicate CSS removed,
          all text converted to English
   ============================================================ */

// ── MOCK DATABASE ─────────────────────────────────────────────
const DB = {
  get: (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

// ── STATIC DATA ───────────────────────────────────────────────
const VENUES = [
  { id: 1, name: 'Thong Nhat Park',    district: 'Hai Ba Trung', lat: 21.0122, lng: 105.8412, isFree: true,  type: 'Park' },
  { id: 2, name: 'Cau Giay Park',      district: 'Cau Giay',     lat: 21.0370, lng: 105.7935, isFree: true,  type: 'Park' },
  { id: 3, name: 'Bach Khoa Stadium',  district: 'Hai Ba Trung', lat: 21.0046, lng: 105.8435, isFree: false, type: 'Stadium' },
  { id: 4, name: 'Hoan Kiem Lake',     district: 'Hoan Kiem',    lat: 21.0285, lng: 105.8522, isFree: true,  type: 'Park' },
  { id: 5, name: 'Dong Da Sports Hub', district: 'Dong Da',      lat: 21.0215, lng: 105.8410, isFree: false, type: 'Gym' },
];

const COMMUNITIES = [
  {
    id: 1, sport: 'Badminton', name: 'Bach Khoa Badminton Club',
    icon: '🏸', district: 'Hai Ba Trung',
    venue: 'Bach Khoa Stadium', members: 120, maxMembers: 150,
    level: 'All levels', isFree: false, monthlyFee: '100,000 VND/month',
    description: 'One of Hanoi\'s most active badminton clubs. Weekly doubles tournaments and coaching sessions every weekend.',
    events: [
      { name: 'Weekly Doubles Ladder', day: 'Every Saturday', time: '7:00 AM', spots: 8 },
      { name: 'Beginner Coaching', day: 'Every Sunday', time: '8:00 AM', spots: 4 },
    ],
  },
  {
    id: 2, sport: 'Running', name: 'Thong Nhat Park Runners',
    icon: '🏃', district: 'Hai Ba Trung',
    venue: 'Thong Nhat Park', members: 350, maxMembers: 500,
    level: 'All levels', isFree: true, monthlyFee: 'Free',
    description: 'Hanoi\'s largest running community. Morning runs Tuesday, Thursday and Sunday. All paces welcome — no one left behind.',
    events: [
      { name: 'Morning Group Run', day: 'Tue / Thu / Sun', time: '5:30 AM', spots: 30 },
      { name: 'Monthly 5K Time Trial', day: 'Last Sunday of month', time: '6:00 AM', spots: 50 },
    ],
  },
  {
    id: 3, sport: 'Pickleball', name: 'Cau Giay Pickleball Community',
    icon: '🏓', district: 'Cau Giay',
    venue: 'Cau Giay Park', members: 85, maxMembers: 100,
    level: 'Beginner – Intermediate', isFree: true, monthlyFee: 'Free',
    description: 'The fastest-growing sport in Hanoi, now with a dedicated community. Equipment loan available for new players.',
    events: [
      { name: 'Open Play Session', day: 'Every Wednesday', time: '6:00 PM', spots: 12 },
      { name: 'Newbie Orientation', day: 'First Saturday of month', time: '9:00 AM', spots: 8 },
    ],
  },
  {
    id: 4, sport: 'Football', name: 'Dong Da Sunday Football',
    icon: '⚽', district: 'Dong Da',
    venue: 'Dong Da Sports Hub', members: 60, maxMembers: 80,
    level: 'Intermediate', isFree: false, monthlyFee: '150,000 VND/month',
    description: 'Competitive 5v5 and 7v7 matches every Sunday morning. Rents the turf field at Dong Da Sports Hub. Serious players only.',
    events: [
      { name: '5v5 League Match', day: 'Every Sunday', time: '7:00 AM', spots: 6 },
      { name: '7v7 Friendly', day: 'Every Saturday', time: '8:00 AM', spots: 4 },
    ],
  },
  {
    id: 5, sport: 'Gym', name: 'Hoan Kiem Morning Fitness Group',
    icon: '🏋️', district: 'Hoan Kiem',
    venue: 'Hoan Kiem Lake', members: 45, maxMembers: 60,
    level: 'All levels', isFree: true, monthlyFee: 'Free',
    description: 'Outdoor calisthenics and bodyweight training at Hoan Kiem Lake. No equipment needed — just show up.',
    events: [
      { name: 'Outdoor Workout', day: 'Mon / Wed / Fri', time: '6:00 AM', spots: 15 },
      { name: 'Weekend HIIT', day: 'Saturday', time: '6:30 AM', spots: 10 },
    ],
  },
  {
    id: 6, sport: 'Cycling', name: 'Hanoi Weekend Cyclists',
    icon: '🚴', district: 'Ba Dinh',
    venue: 'Ho Tay (West Lake)', members: 180, maxMembers: 250,
    level: 'Intermediate – Advanced', isFree: true, monthlyFee: 'Free',
    description: 'Road cycling group with weekend long rides around Hanoi and day trips to Ha Long, Ba Vi. Helmet mandatory.',
    events: [
      { name: 'City Loop Ride', day: 'Every Sunday', time: '5:30 AM', spots: 20 },
      { name: 'Ba Vi Day Trip', day: '2nd Saturday of month', time: '5:00 AM', spots: 12 },
    ],
  },
  {
    id: 7, sport: 'Running', name: 'VNU Campus Runners',
    icon: '🏃', district: 'Cau Giay',
    venue: 'VNU Sports Track', members: 95, maxMembers: 120,
    level: 'Beginner – Intermediate', isFree: true, monthlyFee: 'Free',
    description: 'Open to VNU students and staff. Focus on building the habit of running consistently rather than performance.',
    events: [
      { name: 'Evening Easy Run', day: 'Tue / Thu', time: '6:00 PM', spots: 20 },
      { name: 'Campus 3K Fun Run', day: 'Every Sunday', time: '7:00 AM', spots: 30 },
    ],
  },
  {
    id: 8, sport: 'Badminton', name: 'Hoan Kiem Shuttle Masters',
    icon: '🏸', district: 'Hoan Kiem',
    venue: 'Hoan Kiem Indoor Court', members: 70, maxMembers: 80,
    level: 'Advanced', isFree: false, monthlyFee: '200,000 VND/month',
    description: 'Competitive club for advanced players. Regular inter-district tournaments. Selection trial required to join.',
    events: [
      { name: 'Competitive Practice', day: 'Mon / Wed / Fri', time: '7:00 PM', spots: 6 },
      { name: 'Inter-club Tournament', day: 'Monthly', time: 'TBC', spots: 8 },
    ],
  },
];

// ── SEED SESSIONS ─────────────────────────────────────────────
function seedSessions() {
  if (DB.get('sessions')) return;
  const now = new Date();
  const t = h => new Date(now.getTime() + h * 3600000).toISOString();
  DB.set('sessions', [
    { id: 1, creatorId: 2, creatorName: 'Tran Thi B',   sport: 'Badminton',  level: 'Intermediate', venueId: 1, startTime: t(2),  duration: 60, maxParticipants: 2,  participants: [2],    status: 'Open', commitmentScore: 100 },
    { id: 2, creatorId: 3, creatorName: 'Le Van C',      sport: 'Running',    level: 'Beginner',     venueId: 2, startTime: t(4),  duration: 45, maxParticipants: 4,  participants: [3],    status: 'Open', commitmentScore: 87  },
    { id: 3, creatorId: 4, creatorName: 'Pham Thi D',    sport: 'Football',   level: 'Intermediate', venueId: 3, startTime: t(24), duration: 90, maxParticipants: 10, participants: [4, 5], status: 'Open', commitmentScore: 95  },
    { id: 4, creatorId: 5, creatorName: 'Hoang Van E',   sport: 'Pickleball', level: 'Beginner',     venueId: 4, startTime: t(5),  duration: 60, maxParticipants: 4,  participants: [5],    status: 'Open', commitmentScore: 92  },
    { id: 5, creatorId: 6, creatorName: 'Nguyen Thi F',  sport: 'Gym',        level: 'Advanced',     venueId: 5, startTime: t(3),  duration: 60, maxParticipants: 2,  participants: [6],    status: 'Open', commitmentScore: 78  },
  ]);
}

// ── CURRENT USER ──────────────────────────────────────────────
function getCurrentUser() { return DB.get('currentUser'); }

// ── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast toast-${type} toast-show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('toast-show'), 3000);
}

// ── HEADER ────────────────────────────────────────────────────
function updateHeader() {
  const user   = getCurrentUser();
  const nameEl = document.getElementById('userNameDisplay');
  const scoreEl = document.querySelector('.commitment-badge');
  if (nameEl) nameEl.textContent = user ? `Welcome, ${user.name}` : 'Welcome, Guest';
  if (scoreEl) {
    const score = user?.commitmentScore ?? DB.get('commitmentScore') ?? '--';
    scoreEl.textContent = `Commitment: ${score}/100`;
    scoreEl.className = 'commitment-badge ' + (score >= 90 ? 'score-high' : score >= 70 ? 'score-mid' : 'score-low');
  }
}

// ── ACCOUNT TAB: score display ────────────────────────────────
function updateAccountTab() {
  const user  = getCurrentUser();
  const score = user?.commitmentScore ?? DB.get('commitmentScore') ?? 98;

  const nameEl    = document.getElementById('profileName');
  const scoreDisp = document.getElementById('scoreDisplay');
  const scoreBar  = document.getElementById('scoreBar');

  if (nameEl && user?.name) nameEl.textContent = `${user.name}'s Profile`;
  if (scoreDisp) scoreDisp.textContent = score;
  if (scoreBar) {
    scoreBar.style.width = score + '%';
    scoreBar.style.background = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  }

  // Load saved profile values
  const p = DB.get('userProfile') ?? {};
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  set('p-height', p.height);
  set('p-weight', p.weight);
  set('p-district', p.district);
  set('p-equipment', p.equipment);
  if (p.sports) {
    document.querySelectorAll('input[name="p-sports"]').forEach(cb => {
      cb.checked = p.sports.includes(cb.value);
    });
  }
  renderJoinedSessions();
}

// ── TAB SWITCHING ─────────────────────────────────────────────
function switchTab(tabName) {
  // Hide all tabs & deactivate all buttons
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  // Show target tab
  const target = document.getElementById('tab-' + tabName);
  if (target) target.classList.add('active');

  // Activate matching button
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(`'${tabName}'`)) btn.classList.add('active');
  });

  // Lazy-init map when map tab is first opened
  if (tabName === 'map') {
    if (!mapInitialized) {
      initMap();
      mapInitialized = true;
    } else {
      setTimeout(() => map?.invalidateSize(), 150);
    }
  }

  // Refresh account tab data each time it opens
  if (tabName === 'account') updateAccountTab();

  // Refresh communities each time
  if (tabName === 'communities') renderCommunities();
}

// ── MAP ───────────────────────────────────────────────────────
let map, userMarker, mapInitialized = false;
const sessionMarkers = [];

function initMap() {
  const el = document.getElementById('map');
  if (!el || typeof L === 'undefined') return;

  map = L.map('map').setView([21.028, 105.834], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  plotSessionsOnMap();
  document.getElementById('getLocationBtn')?.addEventListener('click', getUserLocation);
}

function getUserLocation() {
  const btn = document.getElementById('getLocationBtn');
  if (!navigator.geolocation) { showToast('Geolocation not supported.', 'error'); return; }
  if (btn) btn.textContent = 'Locating…';
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker([lat, lng], {
        radius: 10, fillColor: '#2563eb', color: '#fff', weight: 3, opacity: 1, fillOpacity: 1,
      }).addTo(map).bindPopup('<b>📍 You are here</b>').openPopup();
      map.setView([lat, lng], 15);
      if (btn) btn.textContent = '✓ Located';
      showToast('Location found!');
    },
    () => { showToast('Could not get location. Showing Hanoi view.', 'error'); if (btn) btn.textContent = '📍 Locate Me'; }
  );
}

function plotSessionsOnMap(filtered = null) {
  if (!map) return;
  sessionMarkers.forEach(m => map.removeLayer(m));
  sessionMarkers.length = 0;

  (filtered ?? DB.get('sessions') ?? []).forEach(s => {
    const venue     = VENUES.find(v => v.id === s.venueId);
    if (!venue) return;
    const spotsLeft = s.maxParticipants - s.participants.length;
    const color     = spotsLeft > 0 ? '#10b981' : '#ef4444';
    const icon      = L.divIcon({
      html: `<div style="background:${color};color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid #fff">${sportEmoji(s.sport)}</div>`,
      className: '', iconSize: [36, 36], iconAnchor: [18, 18],
    });
    const timeStr = new Date(s.startTime).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const m = L.marker([venue.lat, venue.lng], { icon }).addTo(map).bindPopup(`
      <div style="min-width:180px;font-family:sans-serif;font-size:13px">
        <b style="font-size:14px">${s.sport} Session</b><br>
        <span style="color:#6b7280">by ${s.creatorName}</span><br><br>
        📍 ${venue.name}<br>🕐 ${timeStr}<br>📊 ${s.level}<br>
        ⭐ Commitment: ${s.commitmentScore}/100<br>
        👥 ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left<br><br>
        <button onclick="joinSessionFromMap(${s.id})" style="background:#2563eb;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;width:100%;font-weight:600">Join Session</button>
      </div>`);
    sessionMarkers.push(m);
  });
}

function sportEmoji(sport) {
  return { Running: '🏃', Badminton: '🏸', Football: '⚽', Gym: '🏋️', Pickleball: '🏓' }[sport] ?? '🏅';
}

// ── MATCHING ──────────────────────────────────────────────────
function searchPartners() {
  const sport    = document.getElementById('sport')?.value;
  const level    = document.getElementById('level')?.value;
  const loadingEl = document.getElementById('loadingSection');
  const resultsEl = document.getElementById('resultsSection');
  const searchEl  = document.getElementById('searchSection');

  searchEl?.classList.add('hidden');
  loadingEl?.classList.remove('hidden');
  resultsEl?.classList.add('hidden');

  setTimeout(() => {
    const user   = getCurrentUser();
    const levels = ['Beginner', 'Intermediate', 'Advanced'];
    let sessions = (DB.get('sessions') ?? []).filter(s => {
      if (s.status !== 'Open') return false;
      if (user && s.participants.includes(user.id)) return false;
      if (s.participants.length >= s.maxParticipants) return false;
      if (s.sport !== sport) return false;
      return Math.abs(levels.indexOf(level) - levels.indexOf(s.level)) <= 1;
    });
    sessions.sort((a, b) => b.commitmentScore - a.commitmentScore);
    sessions = sessions.slice(0, 5);

    loadingEl?.classList.add('hidden');
    resultsEl?.classList.remove('hidden');
    renderMatches(sessions, sport, level);

    // Sync map if already initialized
    if (mapInitialized) plotSessionsOnMap(sessions);
  }, 1200);
}

function renderMatches(sessions, sport, level) {
  const list = document.getElementById('matchList');
  if (!list) return;
  if (sessions.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:2.5rem;color:var(--text-light)">
      <div style="font-size:3rem;margin-bottom:0.75rem">😕</div>
      <p>No matches found for <strong>${sport}</strong> — <strong>${level}</strong> right now.</p>
      <p style="margin-top:0.5rem">Try hosting a session yourself!</p></div>`;
    return;
  }
  list.innerHTML = sessions.map(s => {
    const venue     = VENUES.find(v => v.id === s.venueId);
    const spotsLeft = s.maxParticipants - s.participants.length;
    const timeStr   = new Date(s.startTime).toLocaleString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    const sc = s.commitmentScore;
    const scoreBg    = sc >= 90 ? '#d1fae5' : sc >= 70 ? '#fef3c7' : '#fee2e2';
    const scoreColor = sc >= 90 ? '#065f46' : sc >= 70 ? '#92400e' : '#991b1b';
    return `
    <div class="match-card" id="session-${s.id}">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span style="font-size:1.5rem">${sportEmoji(s.sport)}</span>
          <strong style="font-size:1rem">${s.sport} with ${s.creatorName}</strong>
        </div>
        <div class="match-details">
          <span class="tag tag-green">${venue?.isFree ? '🌿 Free Venue' : '💳 Paid Venue'}</span>
          <span class="tag tag-skill">📊 ${s.level}</span>
        </div>
        <div class="match-details" style="margin-top:6px">
          📍 ${venue?.name ?? 'Unknown'} &nbsp;·&nbsp; 🕐 ${timeStr} &nbsp;·&nbsp; ⏱ ${s.duration} min
        </div>
        <div style="margin-top:7px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:0.78rem;background:${scoreBg};color:${scoreColor};padding:2px 9px;border-radius:20px;font-weight:600">⭐ Commitment: ${sc}/100</span>
          <span style="font-size:0.78rem;color:var(--text-light)">👥 ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left</span>
        </div>
      </div>
      <div style="min-width:90px;text-align:center">
        <button class="btn-join" onclick="joinSession(${s.id})" id="join-btn-${s.id}">Join</button>
      </div>
    </div>`;
  }).join('');
}

function joinSession(sessionId) {
  const user     = getCurrentUser() ?? { id: 999, name: 'Guest' };
  const sessions = DB.get('sessions') ?? [];
  const idx      = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;
  const s = sessions[idx];
  if (s.participants.includes(user.id)) { showToast('You already joined this session.', 'error'); return; }
  if (s.participants.length >= s.maxParticipants) { showToast('Session is full.', 'error'); return; }

  sessions[idx].participants.push(user.id);
  if (sessions[idx].participants.length >= sessions[idx].maxParticipants) sessions[idx].status = 'Full';
  DB.set('sessions', sessions);

  const joined = DB.get('joinedSessions') ?? [];
  joined.push({ sessionId, sport: s.sport, creatorName: s.creatorName, joinedAt: new Date().toISOString(), rated: false });
  DB.set('joinedSessions', joined);

  const btn = document.getElementById(`join-btn-${sessionId}`);
  if (btn) { btn.textContent = '✓ Joined'; btn.disabled = true; btn.style.background = '#10b981'; }
  showToast(`Joined ${s.sport} session with ${s.creatorName}! 🎉`);
}

function joinSessionFromMap(id) { joinSession(id); map?.closePopup(); }

function resetSearch() {
  document.getElementById('resultsSection')?.classList.add('hidden');
  document.getElementById('searchSection')?.classList.remove('hidden');
  if (mapInitialized) plotSessionsOnMap();
}

// ── HOST SESSION MODAL ────────────────────────────────────────
function showHostModal() {
  let modal = document.getElementById('hostModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'hostModal';
    modal.innerHTML = `
    <div onclick="closeHostModal()" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem">
      <div onclick="event.stopPropagation()" style="background:#fff;border-radius:14px;padding:2rem;width:100%;max-width:480px;max-height:90vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
          <h2 style="margin:0">Host a Session</h2>
          <button onclick="closeHostModal()" style="width:auto;padding:4px 12px;background:#f1f5f9;color:#6b7280;border:1px solid #e2e8f0;font-size:1rem">✕</button>
        </div>
        <div class="form-group"><label>Sport</label>
          <select id="h-sport"><option>Running</option><option>Badminton</option><option>Football</option><option>Gym</option><option>Pickleball</option></select>
        </div>
        <div class="form-group"><label>Skill Level</label>
          <select id="h-level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
        </div>
        <div class="form-group"><label>Venue</label>
          <select id="h-venue">${VENUES.map(v => `<option value="${v.id}">${v.name} (${v.isFree ? 'Free' : 'Paid'}) — ${v.district}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Date &amp; Time</label><input type="datetime-local" id="h-time"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group"><label>Duration (min)</label>
            <select id="h-duration"><option value="30">30 min</option><option value="45">45 min</option><option value="60" selected>60 min</option><option value="90">90 min</option><option value="120">2 hours</option></select>
          </div>
          <div class="form-group"><label>Max Partners</label>
            <select id="h-max"><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option><option value="5">5</option><option value="9">9</option></select>
          </div>
        </div>
        <button class="btn-primary" onclick="createSession()" style="margin-top:0.5rem">🏅 Create Session</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
  }
  const dt = document.getElementById('h-time');
  if (dt) { const d = new Date(Date.now() + 2*3600000); d.setSeconds(0,0); dt.value = d.toISOString().slice(0,16); }
  modal.classList.remove('hidden');
}

function closeHostModal() { document.getElementById('hostModal')?.classList.add('hidden'); }

function createSession() {
  const sport   = document.getElementById('h-sport')?.value;
  const level   = document.getElementById('h-level')?.value;
  const venueId = parseInt(document.getElementById('h-venue')?.value);
  const timeVal = document.getElementById('h-time')?.value;
  const duration = parseInt(document.getElementById('h-duration')?.value);
  const maxP    = parseInt(document.getElementById('h-max')?.value);

  if (!timeVal) { showToast('Please select a date and time.', 'error'); return; }
  if (new Date(timeVal) <= new Date()) { showToast('Session time must be in the future.', 'error'); return; }

  const user = getCurrentUser() ?? { id: 999, name: 'You', commitmentScore: 98 };
  const sessions = DB.get('sessions') ?? [];
  sessions.push({
    id: Date.now(), creatorId: user.id, creatorName: user.name,
    sport, level, venueId, startTime: new Date(timeVal).toISOString(),
    duration, maxParticipants: maxP, participants: [user.id],
    status: 'Open', commitmentScore: user.commitmentScore ?? 98,
  });
  DB.set('sessions', sessions);
  closeHostModal();
  if (mapInitialized) plotSessionsOnMap();
  showToast('Session created! Others can find and join it now. 🎉');
}

// ── PROFILE / ACCOUNT ─────────────────────────────────────────
function saveProfile() {
  const profile = {
    height:    document.getElementById('p-height')?.value,
    weight:    document.getElementById('p-weight')?.value,
    district:  document.getElementById('p-district')?.value,
    equipment: document.getElementById('p-equipment')?.value,
    sports:    Array.from(document.querySelectorAll('input[name="p-sports"]:checked')).map(cb => cb.value),
  };
  DB.set('userProfile', profile);
  const user = getCurrentUser();
  if (user) { user.district = profile.district; DB.set('currentUser', user); }
  showToast('Profile saved! ✅');
}

// ── JOINED SESSIONS + RATING ──────────────────────────────────
function renderJoinedSessions() {
  const container = document.getElementById('joinedSessionsList');
  if (!container) return;
  const joined = DB.get('joinedSessions') ?? [];
  if (joined.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:1.5rem">No sessions joined yet. Go find a partner! 💪</p>';
    return;
  }
  container.innerHTML = joined.map((j, i) => `
    <div style="border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:0.75rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div>
        <strong>${sportEmoji(j.sport)} ${j.sport}</strong> with ${j.creatorName}<br>
        <span style="font-size:0.83rem;color:var(--text-light)">${new Date(j.joinedAt).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span>
      </div>
      <div>${j.rated
        ? `<span style="color:#10b981;font-weight:600">✓ Rated ${j.rating}★</span>`
        : `<button class="btn-secondary-sm" onclick="openRatingModal(${i})">Rate Partner</button>`}
      </div>
    </div>`).join('');
}

function openRatingModal(idx) {
  document.getElementById('ratingModal')?.remove();
  const j = (DB.get('joinedSessions') ?? [])[idx];
  const modal = document.createElement('div');
  modal.id = 'ratingModal';
  modal.innerHTML = `
  <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;padding:1rem">
    <div style="background:#fff;border-radius:14px;padding:2rem;width:100%;max-width:400px">
      <h3 style="margin-bottom:0.5rem">Rate Your Partner</h3>
      <p style="color:var(--text-light);margin-bottom:1.5rem">How was your session with <strong>${j.creatorName}</strong>?</p>
      <div style="margin-bottom:1rem">
        <label style="display:block;margin-bottom:0.5rem">Overall Rating</label>
        <div id="starPicker" style="display:flex;gap:8px;font-size:2rem;cursor:pointer">
          ${[1,2,3,4,5].map(n => `<span onclick="pickStar(${n})" style="opacity:0.3;transition:opacity 0.1s">⭐</span>`).join('')}
        </div>
      </div>
      <div class="form-group"><label>Punctuality</label>
        <select id="r-punctuality"><option>On time</option><option>Slightly late</option><option>Very late</option></select>
      </div>
      <div class="form-group"><label>Attitude</label>
        <select id="r-attitude"><option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option></select>
      </div>
      <div style="display:flex;gap:10px;margin-top:1rem">
        <button class="btn-primary" onclick="submitRating(${idx})">Submit Review</button>
        <button class="btn-secondary" onclick="document.getElementById('ratingModal').remove()" style="margin:0">Cancel</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
  selectedStar = 0;
}

let selectedStar = 0;
function pickStar(n) {
  selectedStar = n;
  document.querySelectorAll('#starPicker span').forEach((s, i) => s.style.opacity = i < n ? '1' : '0.3');
}

function submitRating(idx) {
  if (selectedStar === 0) { showToast('Please select a star rating.', 'error'); return; }
  const joined = DB.get('joinedSessions') ?? [];
  joined[idx].rated = true;
  joined[idx].rating = selectedStar;
  DB.set('joinedSessions', joined);
  const user = getCurrentUser();
  if (user) {
    user.commitmentScore = Math.min(100, (user.commitmentScore ?? 98) + 1);
    DB.set('currentUser', user);
    DB.set('commitmentScore', user.commitmentScore);
  }
  document.getElementById('ratingModal')?.remove();
  showToast('Review submitted! Your Commitment Score went up. ⭐');
  renderJoinedSessions();
  updateHeader();
  updateAccountTab();
}

// ── COMMUNITIES ───────────────────────────────────────────────
function renderCommunities(list = COMMUNITIES) {
  const grid = document.getElementById('communityGrid');
  if (!grid) return;
  const joinedClubs = DB.get('joinedClubs') ?? [];

  if (list.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:2rem">No clubs match your search.</p>';
    return;
  }

  grid.innerHTML = list.map(c => {
    const isMember  = joinedClubs.includes(c.id);
    const isFull    = c.members >= c.maxMembers;
    const pct       = Math.min(100, Math.round((c.members / c.maxMembers) * 100));
    const barColor  = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#10b981';

    return `
    <div class="comm-card">
      <div class="comm-card-header">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <span style="font-size:1.75rem">${c.icon}</span>
            <div>
              <h3 style="margin:0">${c.name}</h3>
              <span style="font-size:0.78rem;color:var(--text-light)">📍 ${c.venue} · ${c.district}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0">
          <span class="comm-badge ${c.isFree ? 'badge-free' : 'badge-paid'}">${c.isFree ? '🌿 Free' : `💳 ${c.monthlyFee}`}</span>
          ${isMember
            ? `<span class="comm-badge badge-member">✓ Member</span>`
            : isFull
            ? `<span class="comm-badge badge-full">Full</span>`
            : `<button class="btn-primary-sm" onclick="joinClub(${c.id})">Join Club</button>`}
        </div>
      </div>

      <p style="font-size:0.875rem;color:var(--text-light);margin-bottom:0.75rem;line-height:1.55">${c.description}</p>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:0.5rem;font-size:0.82rem;color:var(--text-light)">
        <span>👥 ${c.members} / ${c.maxMembers} members</span>
        <span>📊 ${c.level}</span>
      </div>
      <div style="background:#e5e7eb;border-radius:6px;height:5px;margin-bottom:1rem">
        <div style="background:${barColor};border-radius:6px;height:5px;width:${pct}%;transition:width 0.4s"></div>
      </div>

      <div class="comm-events">
        <p>Upcoming Events</p>
        ${c.events.map(ev => `
          <div class="comm-event-row">
            <span>📅 <strong>${ev.name}</strong></span>
            <span>${ev.day} · ${ev.time}</span>
            <span style="color:${ev.spots <= 3 ? '#ef4444' : 'var(--text-light)'}">${ev.spots} spots</span>
            <button class="btn-secondary-sm" onclick="rsvpEvent('${ev.name}', ${c.id})">RSVP</button>
          </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function joinClub(clubId) {
  const joinedClubs = DB.get('joinedClubs') ?? [];
  if (joinedClubs.includes(clubId)) return;
  joinedClubs.push(clubId);
  DB.set('joinedClubs', joinedClubs);
  const club = COMMUNITIES.find(c => c.id === clubId);
  showToast(`Joined "${club?.name}"! Welcome to the club. 🎉`);
  renderCommunities(getCurrentFilteredCommunities());
}

function rsvpEvent(eventName, clubId) {
  const joinedClubs = DB.get('joinedClubs') ?? [];
  if (!joinedClubs.includes(clubId)) {
    showToast('Join the club first to RSVP for events.', 'error');
    return;
  }
  showToast(`RSVP confirmed for "${eventName}"! See you there. 📅`);
}

function filterCommunities() {
  renderCommunities(getCurrentFilteredCommunities());
}

function getCurrentFilteredCommunities() {
  const query  = document.getElementById('communitySearch')?.value?.toLowerCase().trim() ?? '';
  const filter = document.getElementById('communityFilter')?.value ?? 'all';
  return COMMUNITIES.filter(c => {
    const matchesSport = filter === 'all' || c.sport === filter;
    const matchesQuery = !query || c.name.toLowerCase().includes(query) || c.district.toLowerCase().includes(query) || c.sport.toLowerCase().includes(query);
    return matchesSport && matchesQuery;
  });
}

function showCreateClubModal() {
  showToast('Club creation feature coming soon! Use "Host a Session" for now. 🚧');
}

// ── AUTH ──────────────────────────────────────────────────────
function simulateLogin() {
  const email = document.getElementById('email')?.value?.trim();
  const pass  = document.getElementById('password')?.value;
  if (!email || !pass) { showToast('Please fill in all fields.', 'error'); return; }
  if (!email.includes('@')) { showToast('Invalid email address.', 'error'); return; }
  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  DB.set('currentUser', { id: 1, name, email, commitmentScore: DB.get('commitmentScore') ?? 98 });
  showToast(`Welcome back, ${name}!`);
  setTimeout(() => window.location.href = 'index.html', 800);
}

let currentStep = 1;

function nextStep(step) {
  if (step === 2) {
    if (!Array.from(document.querySelectorAll('input[name="sports[]"]:checked')).length) {
      showToast('Please select at least one sport.', 'error'); return;
    }
    if (!document.getElementById('country-step1')?.value) {
      showToast('Please select a country.', 'error'); return;
    }
  }
  if (step === 3) {
    if (!document.querySelector('input[name="own_gender"]:checked')) { showToast('Please select your gender.', 'error'); return; }
    if (!document.getElementById('signup-age')?.value)               { showToast('Please select your age.', 'error'); return; }
    if (!document.getElementById('location')?.value?.trim())         { showToast('Please enter your location.', 'error'); return; }
  }
  document.getElementById('step-' + currentStep)?.classList.add('hidden');
  document.getElementById('step-' + step)?.classList.remove('hidden');
  document.getElementById('indicator-' + currentStep)?.classList.remove('active');
  document.getElementById('indicator-' + step)?.classList.add('active');
  currentStep = step;
}

function prevStep(step) {
  document.getElementById('step-' + currentStep)?.classList.add('hidden');
  document.getElementById('step-' + step)?.classList.remove('hidden');
  document.getElementById('indicator-' + currentStep)?.classList.remove('active');
  document.getElementById('indicator-' + step)?.classList.add('active');
  currentStep = step;
}

function simulateSignup() {
  const firstname = document.getElementById('firstname')?.value?.trim();
  const email     = document.getElementById('signup-email')?.value?.trim();
  const password  = document.getElementById('signup-password')?.value;
  const terms     = document.querySelector('input[name="terms"]')?.checked;
  if (!firstname || !email || !password) { showToast('Please fill in all fields.', 'error'); return; }
  if (!terms)          { showToast('Please accept the terms.', 'error'); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  const sports = Array.from(document.querySelectorAll('input[name="sports[]"]:checked')).map(cb => cb.value);
  DB.set('currentUser', { id: Date.now(), name: firstname, email, sports, commitmentScore: 100 });
  DB.set('commitmentScore', 100);
  showToast(`Account created! Welcome, ${firstname}! 🏅`);
  setTimeout(() => window.location.href = 'index.html', 1000);
}

function populateAgeDropdown() {
  const sel = document.getElementById('signup-age');
  if (!sel) return;
  for (let a = 15; a <= 70; a++) {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    sel.appendChild(opt);
  }
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  seedSessions();
  updateHeader();
  populateAgeDropdown();

  // Wire up dashboard buttons
  document.getElementById('searchBtn')?.addEventListener('click', searchPartners);
  document.getElementById('hostBtn')?.addEventListener('click', showHostModal);
  document.getElementById('resetBtn')?.addEventListener('click', resetSearch);

  // Live community search
  document.getElementById('communitySearch')?.addEventListener('input', filterCommunities);
  document.getElementById('communityFilter')?.addEventListener('change', filterCommunities);

  // Render communities if that tab is somehow default
  if (document.getElementById('communityGrid')) renderCommunities();

  // If account tab is active on load, populate it
  if (document.getElementById('tab-account')?.classList.contains('active')) updateAccountTab();
});
