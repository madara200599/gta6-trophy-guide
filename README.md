# Platinum Vice — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/madara200599/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/madara200599/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden until earned.

## What it is

A static web app (no build step, no network at run time) that opens in any desktop browser from `app/`:

- **Checklist** — every trophy with its official name, description and grade, a checkbox saved in the browser, and a per-trophy counter for the ones PlayStation tracks (250 stunts, 100 vehicles, 42 Shooting Range challenges, …).
- **Guides with sources** — each trophy has a guide written for this entry, in its own words, with its sources named beside it (Exophase, PSNProfiles, Push Square, and early guides where they are the only source). A guide gives no credit to a location or step it cannot cite: where no published walkthrough pins one down yet, it says so instead of inventing one.
- **Roadmap** — four stages to the platinum, built from the official descriptions: story, activities, collectibles and counters, then cleanup and 100% completion.
- **Missables** — the 19 trophies tied to single story moments, flagged with the honest warning that no trophy is confirmed permanently missable and that early guides report no mission replay (unconfirmed), so keep a manual save at the start of every chapter.
- **Tracker tools** — filters by kind (story, missable, collectibles, activities, online — the list has no online trophies, and the filter says so), by grade, and by search; a spoiler setting that hides story trophies until they are earned; progress saved in localStorage with export to and import from a local file.

## Honesty note

The game launched 19 November 2026, the day this guide was written. No walkthrough has had time to verify every location and step, so this guide never invents one. Every specific number comes from the official trophy descriptions or the progress targets PlayStation tracks, as listed by Exophase and PSNProfiles. Trophy names, descriptions and grades are shown exactly as PlayStation publishes them.

## Run it

Serve `app/` with any static server and open `index.html`:

```sh
python3 -m http.server --directory app 8080
# open http://localhost:8080
```

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Exophase — Grand Theft Auto VI trophies (PS5): https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSNProfiles — Grand Theft Auto VI trophies: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- Push Square — GTA 6 PS5 Trophies Revealed, 100% Completion Needed for the Platinum (18 Nov 2026): https://www.pushsquare.com/news/2026/11/gta-6-ps5-trophies-revealed-100percent-completion-needed-for-the-platinum
- Output Lag — GTA 6 Trophy List: https://outputlag.com/guides/gta-6-trophy-list/

Unofficial fan guide. Not affiliated with Rockstar Games, Take-Two Interactive or Sony Interactive Entertainment. No Rockstar logo, artwork or game screenshot is used.

Entered via referral code r7k9dyj1
