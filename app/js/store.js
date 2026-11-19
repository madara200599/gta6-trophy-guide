// Progress store: earned trophies and counter values, saved in localStorage.
// Export and import are local files only; nothing leaves the browser.

export const STORAGE_KEY = 'platinum-vice-progress-v1';

export function blankState() {
  return { earned: {}, counts: {}, spoiler: false };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankState();
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: progress stays in memory for this session.
  }
}

export function isEarned(state, id) {
  return state.earned[String(id)] === true;
}

export function setEarned(state, id, earned) {
  if (earned) state.earned[String(id)] = true;
  else delete state.earned[String(id)];
  saveState(state);
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function counterValue(state, id) {
  const value = state.counts[String(id)];
  return typeof value === 'number' && value > 0 ? value : 0;
}

export function setCounter(state, id, value) {
  const clamped = Math.max(0, Math.floor(value));
  if (clamped === 0) delete state.counts[String(id)];
  else state.counts[String(id)] = clamped;
  saveState(state);
}

export function exportPayload(state) {
  return {
    app: 'platinum-vice',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).map(Number).sort((a, b) => a - b),
    counts: state.counts,
  };
}

export function downloadExport(state) {
  const payload = exportPayload(state);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gta6-trophy-progress.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Returns { ok: true, imported: n } or { ok: false, error: message }.
// Only ids that exist in the guide are accepted; anything else is ignored.
export function importPayload(state, text, knownIds) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'That file is not a progress export.' };
  const known = new Set(knownIds.map(String));
  let imported = 0;
  if (Array.isArray(parsed.earned)) {
    for (const id of parsed.earned) {
      if (known.has(String(id))) {
        state.earned[String(id)] = true;
        imported += 1;
      }
    }
  }
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const [id, value] of Object.entries(parsed.counts)) {
      if (known.has(String(id)) && typeof value === 'number' && value > 0) {
        state.counts[String(id)] = Math.floor(value);
      }
    }
  }
  saveState(state);
  return { ok: true, imported };
}
