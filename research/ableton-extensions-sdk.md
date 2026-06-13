# Research: Ableton Extensions SDK

> Internal research notes — not published to the docs site (excluded via `.mintignore`).
> Captured 2026-06-13. Relevance: Ableton's official Extensions SDK overlaps Vibrai's
> core territory (programmatic control of a Live Set), so it's worth tracking as both a
> potential integration surface and adjacent tooling.

## Summary

Ableton has released the **public beta of the Extensions SDK** — a free, open
**JavaScript / NodeJS toolkit** for building "Extensions": custom add-on tools that run
alongside Live and plug directly into its workflow. Ableton frames it as an
"experimental playground inside Live," and the scope is deliberately broad.

## What Extensions are

- Optional add-on tools that run alongside Live.
- Installed via **Settings → Extensions**, then invoked from the **right-click context
  menu** on the relevant item (clip, track, etc.). If an Extension applies to what you
  right-clicked, it appears in that menu.
- Can **read the entire structure of a Set and rewrite it**: tracks, clips, MIDI notes,
  devices, parameters, tempo, automation, scenes — and can connect to **external
  services and systems**.
- Range from tiny time-saving utilities to full creative tools with **their own UIs**.

## Example Extensions shipped at launch

| Extension | What it does |
|-----------|--------------|
| **RNMR**    | Batch-renames clips; can analyze a MIDI clip's contents to generate a sensible name. |
| **BBenCut** | Automated breakbeat slicing with multiple algorithms/parameters for rhythmic rearrangement. |
| **DOOM**    | Runs DOOM inside the DAW — a breadth/"because we can" demo. |

## Technical details

- Built on the **NodeJS** runtime using standard web technologies.
- Web tech was chosen explicitly because **AI coding assistants handle it well** — Ableton
  says you may be able to build a working Extension by describing your idea to an AI, with
  no prior coding experience.
- Distinct from the older **Max for Live / Live Object Model (LOM)** JavaScript path:
  Extensions are a first-party, sanctioned, **in-app** integration surface rather than a
  device dropped onto a track.

## Availability

- Requires **Live 12 Suite Beta, version 12.4.5 or later**.
- **Not** available in Live Standard, Intro, or Lite.
- The SDK itself is **free**; full API docs ship with the SDK download.
- Community/collaboration happening on **Ableton's Discord**.
- Note: the SDK is **not** in the public `github.com/Ableton` org (that org only hosts
  Link, LinkKit, Push interface, etc.).

## Relevance to Vibrai

Vibrai is a **.NET engine** that drives Live programmatically through its own bridge,
exposed via a **CLI** and an **MCP server**. The Extensions SDK overlaps in two ways:

1. **New integration surface** — an officially supported, in-app way to reach
   tracks/clips/MIDI/automation that Vibrai could target or interoperate with. E.g. a thin
   Extension that brokers between Live and Vibrai's engine, surfacing generation directly
   in the right-click menu.
2. **Adjacent tooling** — RNMR-style naming and BBenCut-style slicing are exactly the kind
   of "creative manipulation / idea generation" Vibrai's generators do; worth tracking how
   the ecosystem develops.

### Open questions / follow-ups

- What exactly does the Extensions API expose vs. Vibrai's bridge? (Need the actual SDK
  API reference — Ableton domains block automated fetching; pull from the SDK download or
  Discord.)
- Sandboxing / permissions model for Extensions (esp. for the "connect to external
  services" capability).
- Distribution model for sharing Extensions — store? raw files? signing?
- Does the Extension runtime allow long-running processes / outbound network (relevant to
  bridging to a local Vibrai engine or MCP server)?

## Caveat on sourcing

Ableton domains (`ableton.com`, `help.ableton.com`) and several press sites (CDM, Attack,
MusicRadar) return HTTP 403 to automated fetches. The above is assembled from Ableton's
published copy via search excerpts plus secondary coverage, not a full read of the SDK
reference.

## Sources

- [Introducing Extensions SDK — Ableton blog](https://www.ableton.com/en/blog/introducing-extensions-sdk/)
- [Extensions SDK — Ableton](https://www.ableton.com/en/live/extensions)
- [Ableton Extensions FAQ](https://help.ableton.com/hc/en-us/articles/27303428331420-Ableton-Extensions-FAQ)
- [Ableton Extensions will let you code your own tools — CDM Create Digital Music](https://cdm.link/ableton-extensions-beta/)
- [Ableton's Extensions will change how music-makers use Live — MusicRadar](https://www.musicradar.com/music-tech/after-seeing-it-in-action-im-convinced-that-abletons-extensions-is-going-to-change-how-music-makers-use-live-forever)
- [Ableton Extensions SDK Turns Live Suite Into A Development Platform — Attack Magazine](https://www.attackmagazine.com/news/ableton-extensions-sdk-turns-live-suite-into-an-experimental-development-platform/)
