// Filtering and counting: kind, grade, search text, and the spoiler rule.
// Kinds: story, missable (story-moment trophies), collectible, activity, online.
// The official list has no online trophies, so the online filter honestly shows none.

export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  online: 'Online',
};

export function kindOf(trophy) {
  return trophy.kind;
}

export function isMissable(trophy) {
  return trophy.missable === 'moment';
}

export function isStoryMoment(trophy) {
  return trophy.kind === 'story' || trophy.missable === 'moment';
}

export function filterTrophies(trophies, filters) {
  const query = (filters.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind === 'missable' && !isMissable(trophy)) return false;
    if (filters.kind === 'online') return false;
    if (filters.kind && filters.kind !== 'all' && filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
    if (filters.grade && filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function countByGrade(trophies, state) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    totals[trophy.grade] = (totals[trophy.grade] || 0) + 1;
    if (state.earned[String(trophy.id)]) counts[trophy.grade] = (counts[trophy.grade] || 0) + 1;
  }
  return { counts, totals };
}

export function countByKind(trophies) {
  const counts = {};
  for (const trophy of trophies) {
    counts[trophy.kind] = (counts[trophy.kind] || 0) + 1;
  }
  counts.missable = trophies.filter(isMissable).length;
  counts.online = 0;
  return counts;
}

export function stageProgress(trophies, state, stage) {
  const inStage = trophies.filter((trophy) => trophy.stage === stage);
  const earned = inStage.filter((trophy) => state.earned[String(trophy.id)]).length;
  return { earned, total: inStage.length };
}
