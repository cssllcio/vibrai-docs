# Docs Site GA4 Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Analytics 4 to the docs site, gated by the same consent-banner design used on vibrai.com, plus a dedicated privacy/analytics disclosure page and a footer link to revisit consent.

**Architecture:** Mintlify auto-includes any `.js`/`.css` file found in the content directory (same folder as `docs.json`) on every page — no bundler, no module system. Rather than using `docs.json`'s native `integrations.ga4` field (whose interaction with the `integrations.cookies` consent gate is undocumented and unconfirmed — see the shared spec's §3), this plan ships gtag.js loading, Google's consent-mode wiring, and the banner UI all in one self-contained `analytics-consent.js`, giving this site the exact same, fully-understood consent behavior as vibrai.com instead of relying on an ambiguous native integration.

**Tech Stack:** Mintlify (docs.json-configured site), plain JS/CSS (no bundler), vitest 2 (existing, used only for `scripts/generate-reference.ts` — not applicable to this plan's files, see Testing note in Task 2).

**Spec:** The shared cross-repo design spec is committed at `docs/superpowers/specs/2026-09-11-google-analytics-integration-design.md` in `cssllcio/Vibrai` (this repo does not carry its own copy — read it there for the full rationale; this plan implements §3 and §4 of it, resolving the open question in §3 in favor of the custom-JS approach described above).

## Global Constraints

- **Repo:** `cssllcio/vibrai-docs`. Work on a new branch, e.g. `claude/ga4-analytics`.
- **Do not add `integrations.ga4` to `docs.json`.** This plan deliberately does not use Mintlify's native GA4 integration — see Architecture above.
- **Consent storage key is exactly `vibrai_analytics_consent`**, values `"granted"` / `"denied"` — the same key/value shape vibrai-com-web's independent implementation uses.
- **Banner copy is exactly:** "We use Google Analytics to understand site usage." with a "Learn more" link to `/privacy/analytics`, and Accept/Reject buttons — matching vibrai.com's wording.
- **`GA4_MEASUREMENT_ID` in `analytics-consent.js` is a placeholder (`G-YYYYYYYYYY`) until the GA4 property's docs-site data stream exists** (shared spec §1 — a manual step in Google Analytics). Replace it with the real Measurement ID before this ships. (Deliberately a different placeholder from vibrai-com-web's `G-XXXXXXXXXX` — these are two different data streams under one GA4 property.)
- **Do not conflate this with `privacy/telemetry.mdx`.** That page is scoped entirely to in-product CLI/MCP telemetry; this plan's new page is docs-site visitor analytics, a different subject with its own page.
- **The docs site may navigate between pages client-side** (Mintlify's Astro-based renderer). `analytics-consent.js` must not assume it re-runs on every page view the way a full page load would — it attaches its "reopen banner" listener on `document` (event delegation), not on a specific page's DOM node, so it keeps working regardless of how navigation happens.

---

### Task 1: Consent banner stylesheet

**Files:**
- Create: `analytics-consent.css` (repo root, alongside `docs.json`)

- [ ] **Step 1: Write the stylesheet**

Create `analytics-consent.css`:

```css
#vibrai-consent-banner {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #111827;
  color: #e5e7eb;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.25);
}

@media (min-width: 768px) {
  #vibrai-consent-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

@media (prefers-color-scheme: light) {
  #vibrai-consent-banner {
    background: #f9fafb;
    color: #111827;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  }
}

#vibrai-consent-banner p {
  margin: 0;
  font-size: 0.875rem;
}

#vibrai-consent-banner a {
  color: #8477e6;
  font-weight: 600;
}

.vibrai-consent-actions {
  display: flex;
  gap: 0.75rem;
}

.vibrai-consent-actions button {
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.vibrai-consent-actions button[data-action='accept'] {
  background: #6c5cd4;
  color: white;
}

.vibrai-consent-actions button[data-action='reject'] {
  background: transparent;
  border-color: currentColor;
  color: inherit;
}
```

- [ ] **Step 2: Commit**

```bash
git add analytics-consent.css
git commit -m "feat(analytics): add consent banner stylesheet"
```

---

### Task 2: GA4 loader + consent banner script

**Files:**
- Create: `analytics-consent.js` (repo root, alongside `docs.json`)

**Testing note:** This file is a raw script with no module system or bundler — Mintlify's own documented example for adding Google Analytics is exactly this shape (a plain `.js` file, no test framework involved). There is no jsdom/happy-dom in this repo's vitest setup, and adding one solely to exercise this ~60-line file would be disproportionate. Verification is manual (Task 4), matching how this repo already treats its Mintlify-specific configuration.

- [ ] **Step 1: Write the script**

Create `analytics-consent.js`:

```js
(function () {
  var CONSENT_KEY = 'vibrai_analytics_consent';
  // Placeholder until the GA4 property's docs-site data stream exists (shared
  // spec in cssllcio/Vibrai, docs/superpowers/specs/2026-09-11-google-analytics-integration-design.md,
  // §1). Replace with the real Measurement ID before this ships.
  var GA4_MEASUREMENT_ID = 'G-YYYYYYYYYY';

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(CONSENT_KEY);
      return raw === 'granted' || raw === 'denied' ? raw : null;
    } catch (e) {
      // Storage unavailable (private mode, disabled cookies): treat as
      // undecided every time; GA stays off until it becomes available.
      return null;
    }
  }

  function writeConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      // Nothing to do — the decision simply won't persist across reloads.
    }
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('consent', 'default', { analytics_storage: 'denied' });
  gtag('config', GA4_MEASUREMENT_ID);

  var gtagScript = document.createElement('script');
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
  gtagScript.async = true;
  document.head.appendChild(gtagScript);

  function updateConsent(value) {
    window.gtag('consent', 'update', { analytics_storage: value });
  }

  var existing = readConsent();
  if (existing) {
    updateConsent(existing);
  }

  var banner = null;

  function buildBanner() {
    var el = document.createElement('div');
    el.id = 'vibrai-consent-banner';
    el.innerHTML =
      '<p>We use Google Analytics to understand site usage. ' +
      '<a href="/privacy/analytics">Learn more</a>.</p>' +
      '<div class="vibrai-consent-actions">' +
      '<button type="button" data-action="reject">Reject</button>' +
      '<button type="button" data-action="accept">Accept</button>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('[data-action="accept"]').addEventListener('click', function () {
      writeConsent('granted');
      updateConsent('granted');
      el.remove();
    });
    el.querySelector('[data-action="reject"]').addEventListener('click', function () {
      writeConsent('denied');
      updateConsent('denied');
      el.remove();
    });

    return el;
  }

  if (existing === null) {
    banner = buildBanner();
  }

  // Delegated on `document` (not on a specific page's node) so the reopen
  // button keeps working across Mintlify's client-side page navigation.
  document.addEventListener('click', function (event) {
    var target = event.target.closest && event.target.closest('#reopen-consent-banner');
    if (!target) return;
    event.preventDefault();
    if (!banner || !banner.isConnected) {
      banner = buildBanner();
    }
  });
})();
```

- [ ] **Step 2: Commit**

```bash
git add analytics-consent.js
git commit -m "feat(analytics): add GA4 loader and consent banner script"
```

---

### Task 3: Privacy/analytics disclosure page

**Files:**
- Create: `privacy/analytics.mdx`
- Modify: `docs.json`

**Interfaces:**
- Produces: the page at `/privacy/analytics`, which `analytics-consent.js` (Task 2) links to from the banner, and which contains the `#reopen-consent-banner` element Task 2's delegated listener targets.

- [ ] **Step 1: Write the page**

Create `privacy/analytics.mdx`:

```mdx
---
title: "Docs site analytics privacy policy"
description: "What Google Analytics collects on this documentation site, and how to control it."
keywords: ["analytics", "privacy", "cookies", "consent", "ga4", "google analytics"]
---

This page covers analytics on **this documentation site only** — pageviews, referrers, and
similar visitor data. It's a separate subject from [Vibrai's product telemetry](/privacy/telemetry),
which is opt-in data from the CLI and MCP server, not this website.

## What's collected

When you accept the cookie banner, this site loads Google Analytics 4 (GA4), which collects
standard web-analytics data: pages visited, referring site, approximate location
(country/region), and device/browser type.

## What's not collected

Google Analytics does not run on this site until you accept the banner. Rejecting it, or
never responding, keeps Google Analytics off — no requests to Google are made either way
until you choose Accept.

## Changing your choice

<button id="reopen-consent-banner" type="button">
  Change my cookie preference
</button>

Clicking the button above reopens the cookie banner so you can accept or reject again.
```

- [ ] **Step 2: Add the page to navigation**

In `docs.json`, add `"privacy/analytics"` to the `"Guides"` group's `pages` array, right after `"privacy/telemetry"`:

```json
        "pages": [
          "cli/overview",
          "mcp/overview",
          "agent-skill/overview",
          "concepts",
          "design-principles",
          "plugins",
          "drum-maps",
          "mix-diagnostics",
          "sessions",
          "privacy/telemetry",
          "privacy/analytics"
        ]
```

- [ ] **Step 3: Commit**

```bash
git add privacy/analytics.mdx docs.json
git commit -m "docs(privacy): add docs-site analytics disclosure page"
```

---

### Task 4: Footer "Cookie preferences" link

**Files:**
- Modify: `docs.json`

- [ ] **Step 1: Add a footer link column**

`docs.json` currently has no top-level `footer` key. Add one (as a sibling of `navbar` and `contextual`):

```json
  "footer": {
    "links": [
      {
        "header": "Legal",
        "items": [
          { "label": "Cookie preferences", "href": "/privacy/analytics" }
        ]
      }
    ]
  },
```

- [ ] **Step 2: Commit**

```bash
git add docs.json
git commit -m "feat(analytics): add footer link to the analytics privacy page"
```

---

### Task 5: End-to-end manual verification

This task has no automated deliverable — Task 2 already explained why these files aren't unit-tested. This is the substitute: a real preview, checked in a browser, per this project's rule that UI-facing changes get verified before being called done.

- [ ] **Step 1: Run the existing test suite (regression check only)**

Run: `npm test`
Expected: PASS — this plan doesn't touch anything `generate-nav.test.ts` or `render-feature.test.ts` cover, so this should be an unaffected pass.

- [ ] **Step 2: Start the Mintlify dev preview**

Run: `mintlify dev` (or `npx mintlify dev` if the CLI isn't installed globally).

- [ ] **Step 3: Verify the consent flow in a real browser**

- Open the preview in a private/incognito window (clean localStorage).
- Confirm the consent banner appears at the bottom of the page.
- Open DevTools → Network, filter on `google`. Confirm no request to `google-analytics.com`/`analytics.google.com` fires yet.
- Click **Accept**. Confirm the banner disappears and a request to Google now fires.
- Reload the page. Confirm the banner does NOT reappear and the request fires again automatically.
- Open DevTools → Application → Local Storage. Confirm `vibrai_analytics_consent` is `granted`.
- Navigate to `/privacy/analytics` and click **Change my cookie preference**. Confirm the banner reopens. Click **Reject**. Confirm `vibrai_analytics_consent` becomes `denied` and no further Google request fires on reload.
- Click **Cookie preferences** in the footer from at least two different pages (e.g. `/` and `/quickstart`) and confirm it lands on `/privacy/analytics` both times — this is what confirms the delegated click listener survives Mintlify's client-side navigation, per the Global Constraints note.
- Confirm `/privacy/telemetry` is unchanged and `/privacy/analytics` renders correctly with working nav.

- [ ] **Step 4: Open the PR**

Push the branch and open a PR against `main` in `cssllcio/vibrai-docs`, noting in the description that `GA4_MEASUREMENT_ID` in `analytics-consent.js` needs the real Measurement ID from the GA4 property's docs-site data stream before this reaches production.
