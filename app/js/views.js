// Rendering: trophy rows with guides and sources, roadmap stages, missables, source list.
// All text from the data files is escaped before it reaches the page.

import { isEarned, counterValue } from './store.js';
import { isMissable, isStoryMoment, stageProgress } from './filters.js';

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function sourceLink(sourceIndex, key) {
  const source = sourceIndex[key];
  if (!source) return `<li>${escapeHtml(key)}</li>`;
  if (source.url) {
    return `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a></li>`;
  }
  return `<li>${escapeHtml(source.label)}</li>`;
}

function guidePanel(trophy, sourceIndex) {
  const sources = (trophy.sources || []).map((key) => sourceLink(sourceIndex, key)).join('');
  return `<div class="trophy-guide" hidden>
    <p class="guide-label">Guide</p>
    <p>${escapeHtml(trophy.guide)}</p>
    <p class="guide-label">Sources</p>
    <ul class="sources">${sources}</ul>
  </div>`;
}

function tagsFor(trophy) {
  const tags = [`<span class="tag tag-grade-${escapeHtml(trophy.grade)}">${gradeLabel(trophy.grade)}</span>`];
  if (trophy.kind === 'story') tags.push('<span class="tag tag-kind-story">Story</span>');
  if (trophy.kind === 'story') tags.push('<span class="tag tag-hidden">Hidden on PSN</span>');
  if (isMissable(trophy)) tags.push('<span class="tag tag-missable">Missable moment</span>');
  if (trophy.kind === 'collectible') tags.push('<span class="tag">Collectible</span>');
  if (trophy.kind === 'activity') tags.push('<span class="tag">Activity</span>');
  if (trophy.kind === 'platinum') tags.push('<span class="tag">Platinum</span>');
  return tags.join('');
}

function counterControl(trophy, state) {
  if (!trophy.count) return '';
  const value = counterValue(state, trophy.id);
  const target = trophy.count.target;
  const unit = trophy.count.unit;
  const done = value >= target;
  return `<div class="counter" data-counter="${trophy.id}">
    <button type="button" data-step="-1" aria-label="Decrease count">−</button>
    <b>${done ? '✓ ' : ''}${value} / ${target.toLocaleString('en-US')} ${escapeHtml(unit)}</b>
    <button type="button" data-step="1" aria-label="Increase count">+</button>
  </div>`;
}

export function trophyRow(trophy, state, sourceIndex, options = {}) {
  const earned = isEarned(state, trophy.id);
  const spoilerOn = options.spoiler === true;
  const hideSpoiler = spoilerOn && isStoryMoment(trophy) && !earned;
  const classes = ['trophy'];
  if (earned) classes.push('is-earned');
  if (hideSpoiler) classes.push('spoiler-hidden');
  const open = options.open && options.open[String(trophy.id)];
  return `<li class="${classes.join(' ')}" data-trophy="${trophy.id}">
    <div class="trophy-head">
      <label class="trophy-check"><span class="visually-hidden">Earned: ${escapeHtml(trophy.name)}</span>
        <input type="checkbox" data-earned="${trophy.id}" ${earned ? 'checked' : ''}>
      </label>
      <span class="medal medal-${escapeHtml(trophy.grade)}" aria-hidden="true"></span>
      <div class="trophy-body">
        <p class="trophy-name">${escapeHtml(trophy.name)}</p>
        <p class="trophy-desc">${escapeHtml(trophy.description)}</p>
        <div class="trophy-tags">${tagsFor(trophy)}</div>
        ${hideSpoiler ? '<p class="spoiler-note">Story trophy — hidden until earned. Tick the box once you have earned it.</p>' : ''}
        ${guidePanel(trophy, sourceIndex)}
      </div>
      <div class="trophy-actions">
        <button type="button" class="guide-toggle" data-guide="${trophy.id}" aria-expanded="${open ? 'true' : 'false'}">${open ? 'Hide guide' : 'Guide &amp; sources'}</button>
        ${counterControl(trophy, state)}
      </div>
    </div>
  </li>`;
}

export function renderTrophyList(listElement, trophies, state, sourceIndex, options = {}) {
  listElement.innerHTML = trophies.map((trophy) => trophyRow(trophy, state, sourceIndex, options)).join('');
  for (const panel of listElement.querySelectorAll('.trophy-guide')) {
    const id = panel.closest('.trophy').dataset.trophy;
    if (options.open && options.open[String(id)]) panel.hidden = false;
  }
}

export function renderRoadmap(listElement, roadmap, trophies, state) {
  listElement.innerHTML = roadmap.map((stage) => {
    const progress = stageProgress(trophies, state, stage.stage);
    return `<li class="stage">
      <h3>${escapeHtml(stage.title)}</h3>
      <p>${escapeHtml(stage.goal)}</p>
      <p class="stage-includes">${escapeHtml(stage.includes)}</p>
      <p class="stage-progress">${progress.earned} / ${progress.total} trophies in this stage earned</p>
    </li>`;
  }).join('');
}

export function renderMissableWarning(element, warning) {
  element.innerHTML = `<p class="warning-title">No trophy here is confirmed permanently missable — but do not risk it.</p>
    <p>${escapeHtml(warning.note)}</p>
    <p><small>Source: ${escapeHtml(warning.source)}</small></p>`;
}

export function renderSources(listElement, sourceIndex) {
  const notes = {
    exophase: 'Name, description and grade of every trophy; rarity data.',
    psnprofiles: 'Grades and the progress targets PlayStation tracks (counts).',
    pushsquare: 'Report that the list went public on 18 November 2026, ahead of launch.',
    outputlag: 'Early guide; cited only for its no-mission-replay claim, which is unconfirmed.',
    own: 'The advice in each guide — a reading of the official description, not a verified walkthrough.',
  };
  listElement.innerHTML = Object.entries(sourceIndex).map(([key, source]) => {
    const link = source.url
      ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.url)}</a>`
      : '<span>Named in each guide; no link — it is our own advice.</span>';
    return `<li><b>${escapeHtml(source.label)}</b><span>${escapeHtml(notes[key] || '')}</span><br>${link}</li>`;
  }).join('');
}
