// Boot: load the trophy and roadmap data, wire the toolbar, tabs and tracker,
// and render the view named by the URL hash.

import { loadState, saveState, setEarned, setCounter, downloadExport, importPayload, earnedCount } from './store.js';
import { filterTrophies, countByGrade, isMissable } from './filters.js';
import { renderTrophyList, renderRoadmap, renderMissableWarning, renderSources, gradeLabel } from './views.js';

const state = loadState();
const openGuides = {};
const filters = { kind: 'all', grade: 'all', query: '' };

let trophies = [];
let sourceIndex = {};
let roadmap = {};
let missableWarning = null;

const $ = (id) => document.getElementById(id);
const trophyList = $('trophyList');
const listMeta = $('listMeta');
const emptyState = $('emptyState');

function currentView() {
  const hash = location.hash.replace(/^#\/?/, '');
  return ['checklist', 'roadmap', 'missables', 'sources'].includes(hash) ? hash : 'checklist';
}

function showView(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === name);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('is-active', section.id === `view-${name}`);
  }
  if (name === 'roadmap') renderRoadmap($('roadmapList'), roadmap.roadmap, trophies, state);
  if (name === 'missables') renderMissables();
}

function renderMissables() {
  renderTrophyList($('missableList'), trophies.filter(isMissable), state, sourceIndex, { spoiler: state.spoiler, open: openGuides });
}

function updateProgress() {
  const earned = earnedCount(state);
  const total = trophies.length;
  const percent = total ? Math.round((earned / total) * 100) : 0;
  $('earnedCount').textContent = earned;
  $('progressFill').style.width = `${percent}%`;
  $('progressBar').setAttribute('aria-valuenow', String(earned));
  $('progressNote').textContent = `${percent}% to the platinum — ${total - earned} to go`;
  const { counts, totals } = countByGrade(trophies, state);
  $('gradeCounts').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => `<span><b>${counts[grade] || 0}/${totals[grade] || 0}</b> ${gradeLabel(grade)}</span>`)
    .join('');
}

function renderChecklist() {
  const shown = filterTrophies(trophies, filters);
  renderTrophyList(trophyList, shown, state, sourceIndex, { spoiler: state.spoiler, open: openGuides });
  if (filters.kind === 'online') {
    emptyState.hidden = false;
    emptyState.textContent = 'No online trophies in this list — every one of the 55 is single-player, as the early coverage reports. Nothing to track here.';
    listMeta.textContent = '0 trophies';
  } else if (shown.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = 'No trophies match that filter. Clear the search or pick another kind.';
    listMeta.textContent = '0 trophies';
  } else {
    emptyState.hidden = true;
    const earnedShown = shown.filter((trophy) => state.earned[String(trophy.id)]).length;
    listMeta.textContent = `${shown.length} ${shown.length === 1 ? 'trophy' : 'trophies'} shown · ${earnedShown} earned`;
  }
  updateProgress();
}

function rerender() {
  renderChecklist();
  if (currentView() === 'roadmap') renderRoadmap($('roadmapList'), roadmap.roadmap, trophies, state);
  if (currentView() === 'missables') renderMissables();
}

function wireChecklist() {
  trophyList.addEventListener('change', (event) => {
    const box = event.target.closest('[data-earned]');
    if (!box) return;
    setEarned(state, Number(box.dataset.earned), box.checked);
    rerender();
  });
  trophyList.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-guide]');
    if (toggle) {
      const id = toggle.dataset.guide;
      openGuides[id] = !openGuides[id];
      const row = toggle.closest('.trophy');
      const panel = row.querySelector('.trophy-guide');
      panel.hidden = !openGuides[id];
      toggle.setAttribute('aria-expanded', String(openGuides[id]));
      toggle.innerHTML = openGuides[id] ? 'Hide guide' : 'Guide &amp; sources';
      return;
    }
    const step = event.target.closest('[data-step]');
    if (step) {
      const control = step.closest('[data-counter]');
      const id = Number(control.dataset.counter);
      const trophy = trophies.find((item) => item.id === id);
      const current = state.counts[String(id)] || 0;
      const next = Math.max(0, Math.min(trophy.count.target, current + Number(step.dataset.step)));
      setCounter(state, id, next);
      rerender();
    }
  });
  $('missableList').addEventListener('change', (event) => {
    const box = event.target.closest('[data-earned]');
    if (!box) return;
    setEarned(state, Number(box.dataset.earned), box.checked);
    rerender();
  });
  $('missableList').addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-guide]');
    if (!toggle) return;
    const id = toggle.dataset.guide;
    openGuides[id] = !openGuides[id];
    const row = toggle.closest('.trophy');
    const panel = row.querySelector('.trophy-guide');
    panel.hidden = !openGuides[id];
    toggle.setAttribute('aria-expanded', String(openGuides[id]));
    toggle.innerHTML = openGuides[id] ? 'Hide guide' : 'Guide &amp; sources';
  });
}

function wireToolbar() {
  $('searchInput').addEventListener('input', (event) => {
    filters.query = event.target.value;
    renderChecklist();
  });
  $('kindChips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    filters.kind = chip.dataset.kind;
    for (const button of document.querySelectorAll('#kindChips .chip')) {
      button.classList.toggle('is-active', button === chip);
    }
    renderChecklist();
  });
  $('gradeSelect').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    renderChecklist();
  });
  const spoilerToggle = $('spoilerToggle');
  spoilerToggle.checked = state.spoiler;
  spoilerToggle.addEventListener('change', () => {
    state.spoiler = spoilerToggle.checked;
    saveState(state);
    renderChecklist();
    renderMissables();
  });
  $('exportBtn').addEventListener('click', () => downloadExport(state));
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    const result = importPayload(state, text, trophies.map((trophy) => trophy.id));
    if (result.ok) {
      listMeta.textContent = `Imported ${result.imported} earned trophies from ${file.name}.`;
      rerender();
    } else {
      listMeta.textContent = `Import failed: ${result.error}`;
    }
    event.target.value = '';
  });
}

async function boot() {
  const [trophyData, roadmapData] = await Promise.all([
    fetch('data/trophies.json').then((response) => response.json()),
    fetch('data/roadmap.json').then((response) => response.json()),
  ]);
  trophies = trophyData.trophies;
  sourceIndex = trophyData.sources;
  roadmap = roadmapData;
  missableWarning = roadmapData.missableWarning;
  renderMissableWarning($('missableWarning'), missableWarning);
  renderSources($('sourceList'), sourceIndex);
  $('honestyNote').textContent = roadmapData.honesty;
  $('timeNote').textContent = roadmapData.timeNote;
  $('missableBadge').textContent = String(trophies.filter(isMissable).length);
  wireChecklist();
  wireToolbar();
  window.addEventListener('hashchange', () => showView(currentView()));
  showView(currentView());
  renderChecklist();
}

boot().catch((error) => {
  listMeta.textContent = `Could not load the trophy data: ${error.message}`;
});
