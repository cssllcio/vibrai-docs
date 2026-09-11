(function () {
  if (window.__vibraiConsentInit) return;
  window.__vibraiConsentInit = true;

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
